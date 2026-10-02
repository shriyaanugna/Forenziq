import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { generateEvidenceId } from '../utils/idGenerator.js';
import { calculateSHA256 } from '../utils/hashUtils.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// Helper to resolve case by UUID or string ID
async function getCaseByParam(caseIdParam: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);
  let query = supabase.from('cases').select('id, case_id');
  if (isUuid) {
    query = query.eq('id', caseIdParam);
  } else {
    query = query.eq('case_id', caseIdParam);
  }
  const { data, error } = await query.single();
  if (error || !data) return null;
  return data;
}

// GET /api/cases/:caseId/evidence - List evidence for a case
router.get('/:caseId/evidence', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseRecord = await getCaseByParam(caseIdParam);
    if (!caseRecord) {
      res.status(404).json({ error: { message: 'Case not found' } });
      return;
    }

    const { data: evidenceList, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('case_id', caseRecord.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch evidence: ${error.message}`);
    }

    res.json({ data: evidenceList || [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/cases/:caseId/evidence - Upload image or text file evidence
router.post('/:caseId/evidence', uploadMiddleware.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseRecord = await getCaseByParam(caseIdParam);
    if (!caseRecord) {
      res.status(404).json({ error: { message: 'Case not found' } });
      return;
    }

    const file = req.file;
    const pastedText = req.body.text_content;

    let buffer: Buffer;
    let fileName: string;
    let mimeType: string;
    let evidenceType: 'IMAGE' | 'CHAT' | 'TEXT';

    if (file) {
      buffer = file.buffer;
      fileName = file.originalname;
      mimeType = file.mimetype;
      if (mimeType.startsWith('image/')) {
        evidenceType = 'IMAGE';
      } else {
        evidenceType = 'CHAT';
      }
    } else if (pastedText && typeof pastedText === 'string' && pastedText.trim().length > 0) {
      buffer = Buffer.from(pastedText, 'utf-8');
      fileName = `pasted_chat_${Date.now()}.txt`;
      mimeType = 'text/plain';
      evidenceType = 'CHAT';
    } else {
      res.status(400).json({ error: { message: 'No file or text content provided.' } });
      return;
    }

    // 1. Calculate SHA-256 hash
    const sha256Hash = calculateSHA256(buffer);

    // 2. Generate Evidence ID
    const evidenceIdStr = generateEvidenceId(evidenceType);

    // 3. Upload original file to Supabase Storage bucket 'evidence'
    const storagePath = `${caseRecord.case_id}/${evidenceIdStr}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: storageError } = await supabase.storage
      .from('evidence')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (storageError) {
      console.warn('Supabase storage upload notice:', storageError.message);
    }

    // 4. Create evidence record in PostgreSQL database
    const { data: newEvidence, error: dbError } = await supabase
      .from('evidence')
      .insert({
        evidence_id: evidenceIdStr,
        case_id: caseRecord.id,
        type: evidenceType,
        file_name: fileName,
        file_path: storagePath,
        file_size: buffer.length,
        mime_type: mimeType,
        sha256_hash: sha256Hash,
        source: req.body.source || (file ? 'FILE_UPLOAD' : 'PASTED_TEXT'),
        analysis_status: 'PENDING',
        metadata: pastedText ? { pasted_text: pastedText } : {},
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Failed to persist evidence record: ${dbError.message}`);
    }

    res.status(201).json({ data: newEvidence });
  } catch (err) {
    next(err);
  }
});

export default router;
