import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { AIService } from '../services/ai/AIService.js';

const router = Router();
const aiService = new AIService();

// GET /api/dashboard/stats - Real database metrics
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [casesRes, evidenceRes, findingsRes, recentCasesRes, recentFindingsRes] = await Promise.all([
      supabase.from('cases').select('id, status', { count: 'exact' }),
      supabase.from('evidence').select('id', { count: 'exact' }),
      supabase.from('findings').select('id, severity', { count: 'exact' }),
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('findings').select('*, cases(title, case_id)').order('created_at', { ascending: false }).limit(5),
    ]);

    const totalCases = casesRes.count || 0;
    const activeCases = casesRes.data?.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length || 0;
    const completedCases = casesRes.data?.filter(c => c.status === 'CLOSED').length || 0;
    const evidenceCount = evidenceRes.count || 0;
    const findingsCount = findingsRes.count || 0;

    const severityBreakdown = {
      CRITICAL: findingsRes.data?.filter(f => f.severity === 'CRITICAL').length || 0,
      HIGH: findingsRes.data?.filter(f => f.severity === 'HIGH').length || 0,
      MEDIUM: findingsRes.data?.filter(f => f.severity === 'MEDIUM').length || 0,
      LOW: findingsRes.data?.filter(f => f.severity === 'LOW').length || 0,
    };

    res.json({
      data: {
        total_cases: totalCases,
        active_cases: activeCases,
        completed_cases: completedCases,
        evidence_count: evidenceCount,
        findings_count: findingsCount,
        severity_breakdown: severityBreakdown,
        recent_cases: recentCasesRes.data || [],
        recent_findings: recentFindingsRes.data || [],
        configured_ai_providers: aiService.getAvailableProviders(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
