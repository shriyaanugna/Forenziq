import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { generateCaseId } from '../utils/idGenerator.js';
import { AuditService } from '../services/auditService.js';
import { z } from 'zod';

const router = Router();

const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  investigator_name: z.string().optional().default('Investigator'),
  metadata: z.record(z.any()).optional().default({}),
});

// POST /api/cases - Create new forensic case
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: { message: 'Invalid request payload', details: parseResult.error.format() } });
      return;
    }

    const { title, description, investigator_name, metadata } = parseResult.data;
    const caseIdString = generateCaseId();

    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        case_id: caseIdString,
        title,
        description,
        status: 'OPEN',
        metadata: { ...metadata, investigator_name },
      })
      .select()
      .single();

    if (error || !newCase) {
      throw new Error(`Failed to create case in database: ${error?.message}`);
    }

    // Log chain-of-custody audit event
    await AuditService.logEvent({
      caseId: newCase.id,
      eventType: 'CASE_CREATED',
      description: `Forensic case ${caseIdString} '${title}' initialized by ${investigator_name}.`,
      metadata: { case_id: caseIdString, investigator: investigator_name },
    });

    res.status(201).json({ data: newCase });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases - List all cases
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    res.json({ data: cases || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId - Get single case details with stats
router.get('/:caseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;

    // Search by UUID or human-readable case_id string
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);

    let query = supabase.from('cases').select('*');
    if (isUuid) {
      query = query.eq('id', caseIdParam);
    } else {
      query = query.eq('case_id', caseIdParam);
    }

    const { data: caseItem, error } = await query.single();

    if (error || !caseItem) {
      res.status(404).json({ error: { message: `Case with ID '${caseIdParam}' not found.` } });
      return;
    }

    res.json({ data: caseItem });
  } catch (err) {
    next(err);
  }
});

export default router;
