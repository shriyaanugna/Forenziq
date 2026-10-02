import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabaseClient.js';
import { ReportService } from '../services/reportService.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

async function getCaseUuid(caseIdParam: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseIdParam);
  if (isUuid) return caseIdParam;
  const { data } = await supabase.from('cases').select('id').eq('case_id', caseIdParam).single();
  return data ? data.id : null;
}

// POST /api/cases/:caseId/reports - Generate a new forensic report for a case
router.post('/cases/:caseId/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseUuid = await getCaseUuid(caseIdParam);

    if (!caseUuid) {
      res.status(404).json({ error: { message: `Case '${caseIdParam}' not found.` } });
      return;
    }

    const report = await ReportService.generateCaseReport(caseUuid);
    res.status(201).json({ data: report });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:caseId/reports - Get all reports for a case
router.get('/cases/:caseId/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseIdParam = Array.isArray(req.params.caseId) ? req.params.caseId[0] : req.params.caseId;
    const caseUuid = await getCaseUuid(caseIdParam);

    if (!caseUuid) {
      res.status(404).json({ error: { message: `Case '${caseIdParam}' not found.` } });
      return;
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('case_id', caseUuid)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    res.json({ data: reports || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports - Get all reports across cases
router.get('/reports', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*, cases(case_id, title)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list reports: ${error.message}`);
    }

    res.json({ data: reports || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:reportId - Retrieve report details or download stream
router.get('/reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportIdParam = Array.isArray(req.params.reportId) ? req.params.reportId[0] : req.params.reportId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportIdParam);

    let query = supabase.from('reports').select('*');
    if (isUuid) {
      query = query.eq('id', reportIdParam);
    } else {
      query = query.eq('report_id', reportIdParam);
    }

    const { data: report, error } = await query.single();
    if (error || !report) {
      res.status(404).json({ error: { message: `Report '${reportIdParam}' not found.` } });
      return;
    }

    // Check if download requested via query string ?download=true
    if (req.query.download === 'true') {
      let fileData: Blob | null = null;
      let { data, error: dlErr } = await supabase.storage.from('reports').download(report.storage_path);

      if ((dlErr || !data) && report.case_id) {
        // Fallback: regenerate report if missing from storage bucket
        try {
          const regenerated = await ReportService.generateCaseReport(report.case_id);
          const dlRes = await supabase.storage.from('reports').download(regenerated.storage_path);
          data = dlRes.data;
          dlErr = dlRes.error;
        } catch {
          // Ignore fallback failure
        }
      }

      fileData = data;

      if (dlErr || !fileData) {
        res.status(404).json({ error: { message: 'Report PDF file not found in storage.' } });
        return;
      }

      await AuditService.logEvent({
        caseId: report.case_id,
        eventType: 'REPORT_DOWNLOADED',
        description: `Forensic PDF report ${report.report_id} downloaded.`,
        metadata: { report_id: report.report_id },
      });

      const buffer = Buffer.from(await fileData.arrayBuffer());
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.file_name}"`);
      res.send(buffer);
      return;
    }

    // Otherwise log view event and return metadata
    await AuditService.logEvent({
      caseId: report.case_id,
      eventType: 'REPORT_VIEWED',
      description: `Forensic report ${report.report_id} metadata viewed.`,
      metadata: { report_id: report.report_id },
    });

    res.json({ data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
