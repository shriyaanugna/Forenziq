import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { CorrelationEngine } from '../services/correlationEngine.js';

const router = Router();
const correlationEngine = new CorrelationEngine();

async function getCaseUuid(caseIdParam: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);
  if (isUuid) return caseIdParam;
  const { data } = await supabase.from('cases').select('id').eq('case_id', caseIdParam).single();
  return data ? data.id : null;
}

// POST /api/cases/:caseId/correlations - Trigger cross-evidence correlation scan
router.post('/:caseId/correlations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseUuid = await getCaseUuid(caseIdParam);

    if (!caseUuid) {
      res.status(404).json({ error: { message: `Case '${caseIdParam}' not found.` } });
      return;
    }

    const correlations = await correlationEngine.correlateCase(caseUuid);
    res.status(200).json({ data: correlations });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId/correlations - Get all correlations for a case
router.get('/:caseId/correlations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseUuid = await getCaseUuid(caseIdParam);

    if (!caseUuid) {
      res.status(404).json({ error: { message: `Case '${caseIdParam}' not found.` } });
      return;
    }

    const { data: correlations, error } = await supabase
      .from('correlations')
      .select('*')
      .eq('case_id', caseUuid)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch correlations: ${error.message}`);
    }

    res.json({ data: correlations || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
