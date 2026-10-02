import PDFDocument from 'pdfkit';
import { Case, Evidence, Finding, Correlation, AuditLog } from '../types/index.js';

export interface ReportData {
  caseItem: Case;
  evidenceList: Evidence[];
  findingsList: Finding[];
  correlationsList: Correlation[];
  auditLogs: AuditLog[];
}

export function generatePDFReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const { caseItem, evidenceList, findingsList, correlationsList, auditLogs } = data;

      // 1. COVER PAGE
      doc.fillColor('#0F172A').rect(0, 0, doc.page.width, doc.page.height).fill();

      doc.fillColor('#38BDF8').fontSize(26).text('FORENZIQ', 40, 150, { align: 'center' });
      doc.fillColor('#94A3B8').fontSize(14).text('AUTOMATED DIGITAL FORENSICS REPORT', { align: 'center' });

      doc.moveDown(3);
      doc.fillColor('#FFFFFF').fontSize(18).text(caseItem.title, { align: 'center' });
      doc.fillColor('#38BDF8').fontSize(12).text(`CASE ID: ${caseItem.case_id}`, { align: 'center' });

      doc.moveDown(4);
      doc.fillColor('#94A3B8').fontSize(10).text(`Generated: ${new Date().toUTCString()}`, { align: 'center' });
      doc.text(`Lead Investigator: ${caseItem.metadata?.investigator_name || 'Assigned Officer'}`, { align: 'center' });

      doc.moveDown(4);
      doc.fillColor('#EF4444').fontSize(10).text('CONFIDENTIAL — Law Enforcement / Cyber Security Use Only', { align: 'center' });

      doc.addPage();

      // Reset styles for inner pages
      const addHeader = (title: string) => {
        doc.fillColor('#0284C7').fontSize(16).text(title).moveDown(0.5);
        doc.strokeColor('#334155').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke().moveDown(1);
      };

      // 2. CASE & EXECUTIVE SUMMARY
      doc.fillColor('#0F172A');
      addHeader('1. Executive Summary & Case Overview');
      doc.fillColor('#1E293B').fontSize(10).text(`Case ID: ${caseItem.case_id}`);
      doc.text(`Title: ${caseItem.title}`);
      doc.text(`Status: ${caseItem.status}`);
      doc.text(`Description: ${caseItem.description || 'N/A'}`);
      doc.moveDown(1);

      doc.text(`Total Evidence Analyzed: ${evidenceList.length}`);
      doc.text(`Total Findings Generated: ${findingsList.length}`);
      doc.text(`Cross-Evidence Correlations: ${correlationsList.length}`);
      doc.moveDown(2);

      // 3. EVIDENCE INVENTORY & HASHES
      addHeader('2. Evidence Inventory & Cryptographic Hashes');
      if (evidenceList.length === 0) {
        doc.fillColor('#64748B').fontSize(10).text('No evidence items recorded for this case.');
      } else {
        evidenceList.forEach((ev, idx) => {
          doc.fillColor('#0F172A').fontSize(11).text(`${idx + 1}. [${ev.evidence_id}] ${ev.file_name}`);
          doc.fillColor('#475569').fontSize(9).text(`   Type: ${ev.type} | MIME: ${ev.mime_type} | Size: ${ev.file_size} bytes`);
          doc.fillColor('#0284C7').fontSize(9).text(`   SHA-256: ${ev.sha256_hash}`);
          doc.moveDown(0.5);
        });
      }
      doc.moveDown(1.5);

      // 4. FORENSIC FINDINGS & SEVERITY
      addHeader('3. Forensic Findings & Severity Assessment');
      if (findingsList.length === 0) {
        doc.fillColor('#64748B').fontSize(10).text('No findings detected.');
      } else {
        findingsList.forEach((fnd, idx) => {
          doc.fillColor('#0F172A').fontSize(11).text(`${idx + 1}. [${fnd.finding_id}] ${fnd.title} (${fnd.severity})`);
          doc.fillColor('#334155').fontSize(9).text(`   Description: ${fnd.description}`);
          doc.fillColor('#475569').fontSize(9).text(`   Confidence: ${(fnd.confidence * 100).toFixed(0)}%`);
          doc.fillColor('#64748B').fontSize(8).text(`   Reasoning: ${fnd.reasoning}`);
          doc.moveDown(0.8);
        });
      }
      doc.moveDown(1.5);

      // 5. CROSS-EVIDENCE CORRELATIONS
      addHeader('4. Cross-Evidence Correlation Analysis');
      if (correlationsList.length === 0) {
        doc.fillColor('#64748B').fontSize(10).text('No cross-evidence correlations identified.');
      } else {
        correlationsList.forEach((crl, idx) => {
          doc.fillColor('#0F172A').fontSize(10).text(`${idx + 1}. [${crl.correlation_id}] Matched Entity: ${crl.matched_entity_value} (${crl.matched_entity_type})`);
          doc.fillColor('#475569').fontSize(9).text(`   Confidence: ${(crl.confidence * 100).toFixed(0)}% | ${crl.reason}`);
          doc.moveDown(0.5);
        });
      }
      doc.moveDown(1.5);

      // 6. CHAIN OF CUSTODY AUDIT TRAIL
      addHeader('5. Chain of Custody & Audit Log');
      if (auditLogs.length === 0) {
        doc.fillColor('#64748B').fontSize(10).text('No audit events logged.');
      } else {
        auditLogs.forEach((log) => {
          doc.fillColor('#0F172A').fontSize(9).text(`• [${new Date(log.created_at).toISOString()}] ${log.event_type}: ${log.description}`);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
