import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

async function getCaseUuid(caseIdParam: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);
  if (isUuid) return caseIdParam;
  const { data } = await supabase.from('cases').select('id').eq('case_id', caseIdParam).single();
  return data ? data.id : null;
}

// GET /api/cases/:caseId/audit - Retrieve chain of custody audit logs for a case
router.get('/:caseId/audit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseUuid = await getCaseUuid(caseIdParam);

    if (!caseUuid) {
      res.status(404).json({ error: { message: `Case '${caseIdParam}' not found.` } });
      return;
    }

    const auditTrail = await AuditService.getCaseAuditTrail(caseUuid);
    res.json({ data: auditTrail });
  } catch (err) {
    next(err);
  }
});

export default router;
