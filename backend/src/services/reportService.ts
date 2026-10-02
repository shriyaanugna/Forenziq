import { supabase } from '../utils/supabaseClient.js';
import { generateReportId } from '../utils/idGenerator.js';
import { generatePDFReport } from './reportGenerator.js';
import { AuditService } from './auditService.js';
import { Report } from '../types/index.js';

export class ReportService {
  /**
   * Generates a complete forensic PDF report for a case, uploads it to Supabase Storage ('reports' bucket),
   * records report metadata in PostgreSQL, and logs a chain-of-custody audit event.
   */
  static async generateCaseReport(caseId: string): Promise<Report> {
    // 1. Fetch all case information
    const [
      { data: caseItem, error: caseErr },
      { data: evidenceList },
      { data: findingsList },
      { data: correlationsList },
      { data: auditLogs },
    ] = await Promise.all([
      supabase.from('cases').select('*').eq('id', caseId).single(),
      supabase.from('evidence').select('*').eq('case_id', caseId),
      supabase.from('findings').select('*').eq('case_id', caseId),
      supabase.from('correlations').select('*').eq('case_id', caseId),
      supabase.from('audit_logs').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
    ]);

    if (caseErr || !caseItem) {
      throw new Error(`Case '${caseId}' not found for report generation.`);
    }

    // 2. Generate PDF Buffer
    const pdfBuffer = await generatePDFReport({
      caseItem,
      evidenceList: evidenceList || [],
      findingsList: findingsList || [],
      correlationsList: correlationsList || [],
      auditLogs: auditLogs || [],
    });

    // 3. Upload to Supabase Storage 'reports' bucket
    const reportIdStr = generateReportId();
    const fileName = `Forensic_Report_${caseItem.case_id}_${reportIdStr}.pdf`;
    const storagePath = `${caseItem.case_id}/${fileName}`;

    const { error: storageErr } = await supabase.storage
      .from('reports')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (storageErr) {
      console.warn('[REPORT STORAGE NOTICE]: Uploading to Supabase Storage noticed:', storageErr.message);
    }

    // 4. Persist Report Metadata in PostgreSQL
    const { data: reportRecord, error: dbErr } = await supabase
      .from('reports')
      .insert({
        report_id: reportIdStr,
        case_id: caseId,
        file_name: fileName,
        storage_path: storagePath,
        status: 'GENERATED',
        metadata: {
          evidence_count: (evidenceList || []).length,
          findings_count: (findingsList || []).length,
          correlations_count: (correlationsList || []).length,
        },
      })
      .select()
      .single();

    if (dbErr || !reportRecord) {
      throw new Error(`Failed to persist report record in database: ${dbErr?.message}`);
    }

    // 5. Log Chain of Custody Audit Event
    await AuditService.logEvent({
      caseId,
      eventType: 'REPORT_GENERATED',
      description: `Forensic PDF report ${reportIdStr} (${fileName}) generated and stored.`,
      metadata: { report_id: reportIdStr, file_name: fileName },
    });

    return reportRecord as Report;
  }
}
