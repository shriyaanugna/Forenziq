import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { AIService } from '../services/ai/AIService.js';
import { OCRService } from '../services/ocrService.js';
import { evaluateSeverity } from '../services/severityEngine.js';
import { generateFindingId } from '../utils/idGenerator.js';
import { AuditService } from '../services/auditService.js';
import { CorrelationEngine } from '../services/correlationEngine.js';

const router = Router();
const aiService = new AIService();
const ocrService = new OCRService();
const correlationEngine = new CorrelationEngine(aiService);

// POST /api/evidence/:evidenceId/analyze - Trigger real AI/OCR analysis
router.post('/evidence/:evidenceId/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evidenceIdParam = Array.isArray(req.params.evidenceId) ? req.params.evidenceId[0] : req.params.evidenceId;

    // 1. Fetch evidence record
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(evidenceIdParam);
    let query = supabase.from('evidence').select('*');
    if (isUuid) {
      query = query.eq('id', evidenceIdParam);
    } else {
      query = query.eq('evidence_id', evidenceIdParam);
    }

    const { data: evidence, error: evError } = await query.single();
    if (evError || !evidence) {
      res.status(404).json({ error: { message: `Evidence '${evidenceIdParam}' not found.` } });
      return;
    }

    // Update status to ANALYZING
    await supabase.from('evidence').update({ analysis_status: 'ANALYZING' }).eq('id', evidence.id);

    try {
      let aiResult;
      let ocrText = '';

      if (evidence.type === 'IMAGE') {
        // Download image from storage if available
        let fileBuffer: Buffer | null = null;
        const { data: storageData, error: dlError } = await supabase.storage.from('evidence').download(evidence.file_path);

        if (!dlError && storageData) {
          const arrayBuffer = await storageData.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        }

        if (fileBuffer) {
          // Perform OCR extraction first
          const ocrRes = await ocrService.extractText(fileBuffer, evidence.mime_type);
          ocrText = ocrRes.text;

          // Perform Vision / AI Analysis
          aiResult = await aiService.analyzeImage(fileBuffer, evidence.mime_type, ocrText);
        } else {
          throw new Error('Unable to download evidence image from Supabase storage for analysis.');
        }
      } else {
        // CHAT or TEXT evidence
        let textContent = evidence.metadata?.pasted_text;

        if (!textContent) {
          // Download text file from storage
          const { data: storageData, error: dlError } = await supabase.storage.from('evidence').download(evidence.file_path);
          if (!dlError && storageData) {
            textContent = await storageData.text();
          }
        }

        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Evidence contains no readable text content to analyze.');
        }

        aiResult = await aiService.analyzeText(textContent);
      }

      // 2. Pass AI extracted findings to Deterministic Severity Engine
      const severityEvaluation = evaluateSeverity({
        suggestedSeverity: aiResult.suggested_severity,
        confidence: aiResult.confidence,
        entities: aiResult.entities,
        indicators: aiResult.indicators,
        textContext: `${aiResult.summary} ${aiResult.description}`,
      });

      // 3. Generate structured finding record
      const findingIdStr = generateFindingId();
      const { data: newFinding, error: fndDbError } = await supabase
        .from('findings')
        .insert({
          finding_id: findingIdStr,
          case_id: evidence.case_id,
          evidence_id: evidence.id,
          finding_type: aiResult.finding_type || 'FORENSIC_ANALYSIS',
          title: aiResult.title || 'Extracted Forensic Finding',
          description: aiResult.description || 'Forensic analysis completed.',
          severity: severityEvaluation.severity,
          confidence: aiResult.confidence ?? 0.85,
          reasoning: `${aiResult.reasoning || ''}\n\n[Deterministic Engine Evaluation]: Score=${severityEvaluation.score}. ${severityEvaluation.reasons.join('; ')}`,
          entities: aiResult.entities || {},
          indicators: aiResult.indicators || [],
          metadata: {
            ai_provider: aiResult.raw_provider,
            ocr_text: ocrText,
            severity_score: severityEvaluation.score,
          },
        })
        .select()
        .single();

      if (fndDbError || !newFinding) {
        throw new Error(`Failed to insert finding into database: ${fndDbError?.message}`);
      }

      // Update evidence status to COMPLETED
      await supabase.from('evidence').update({ analysis_status: 'COMPLETED' }).eq('id', evidence.id);

      // Log chain-of-custody audit logs
      await AuditService.logEvent({
        caseId: evidence.case_id,
        evidenceId: evidence.id,
        eventType: 'EVIDENCE_ANALYZED',
        description: `AI analysis completed for evidence ${evidence.evidence_id}. Provider: ${aiResult.raw_provider || 'AI Engine'}.`,
        metadata: { evidence_id: evidence.evidence_id, provider: aiResult.raw_provider },
      });

      await AuditService.logEvent({
        caseId: evidence.case_id,
        evidenceId: evidence.id,
        eventType: 'FINDING_CREATED',
        description: `Finding ${findingIdStr} '${newFinding.title}' (${newFinding.severity}) generated for evidence ${evidence.evidence_id}.`,
        metadata: { finding_id: findingIdStr, severity: newFinding.severity },
      });

      // Automatically trigger cross-evidence correlation scan for case
      try {
        await correlationEngine.correlateCase(evidence.case_id);
      } catch (corrErr: any) {
        console.warn('Automatic correlation scan notice:', corrErr.message);
      }

      res.status(200).json({
        data: {
          finding: newFinding,
          evidence_status: 'COMPLETED',
        },
      });
    } catch (analysisErr: any) {
      await supabase.from('evidence').update({ analysis_status: 'FAILED' }).eq('id', evidence.id);
      throw analysisErr;
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId/findings - Get all findings for a case
router.get('/cases/:caseId/findings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);

    let caseUuid = caseIdParam;
    if (!isUuid) {
      const { data: caseRec } = await supabase.from('cases').select('id').eq('case_id', caseIdParam).single();
      if (caseRec) caseUuid = caseRec.id;
    }

    const { data: findings, error } = await supabase
      .from('findings')
      .select('*')
      .eq('case_id', caseUuid)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch findings: ${error.message}`);
    }

    res.json({ data: findings || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
