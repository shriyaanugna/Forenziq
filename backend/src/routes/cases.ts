import { Router, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { generateCaseId } from '../utils/idGenerator.js';
import { AuditService } from '../services/auditService.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  investigator_name: z.string().optional().default('Investigator'),
  metadata: z.record(z.any()).optional().default({}),
});

// POST /api/cases - Create new forensic case
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parseResult = createCaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: { message: 'Invalid request payload', details: parseResult.error.format() } });
      return;
    }

    const { title, description, investigator_name, metadata } = parseResult.data;
    const caseIdString = generateCaseId();
    const investigatorId = req.user?.id || null;

    if (investigatorId) {
      // Ensure the investigator user record exists in public.users to satisfy cases_investigator_id_fkey
      const userEmail = req.user?.email || `${investigatorId}@investigator.local`;
      const userName = req.user?.name || investigator_name || 'Investigator';

      const { error: userUpsertError } = await supabase.from('users').upsert({
        id: investigatorId,
        email: userEmail,
        name: userName,
      }, { onConflict: 'id' });

      if (userUpsertError) {
        console.warn('[CASE CREATION] Notice upserting investigator into users table:', userUpsertError.message);
      }
    }

    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        case_id: caseIdString,
        title,
        description,
        investigator_id: investigatorId,
        status: 'OPEN',
        metadata: { ...metadata, investigator_name: req.user?.name || investigator_name },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
        res.status(400).json({
          error: {
            message: 'Invalid investigator ID provided. The specified investigator record does not exist in the database.',
            code: 'INVALID_INVESTIGATOR_REFERENCE',
          },
        });
        return;
      }
      throw new Error(`Failed to create case in database: ${error.message}`);
    }

    if (!newCase) {
      throw new Error('Failed to create case in database: No record returned.');
    }

    // Log chain-of-custody audit event
    await AuditService.logEvent({
      caseId: newCase.id,
      eventType: 'CASE_CREATED',
      actorUserId: investigatorId || undefined,
      description: `Forensic case ${caseIdString} '${title}' initialized by ${req.user?.name || investigator_name}.`,
      metadata: { case_id: caseIdString, investigator: req.user?.name || investigator_name },
    });

    res.status(201).json({ data: newCase });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases - List cases for user (or all cases if unauthenticated / system level)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let query = supabase.from('cases').select('*');

    // Filter by investigator_id if user is authenticated (including unassigned legacy cases)
    if (req.user?.id) {
      query = query.or(`investigator_id.eq.${req.user.id},investigator_id.is.null`);
    }

    const { data: cases, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    res.json({ data: cases || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId - Get single case details with stats
router.get('/:caseId', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    // Verify access permission if case is owned by another investigator
    if (req.user?.id && caseItem.investigator_id && caseItem.investigator_id !== req.user.id) {
      res.status(403).json({ error: { message: 'Access denied. You do not have permission to view this forensic case.' } });
      return;
    }

    res.json({ data: caseItem });
  } catch (err) {
    next(err);
  }
});

export default router;
