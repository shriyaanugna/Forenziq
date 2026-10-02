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
      const doc = new PDFDocument({
        margin: 45,
        bufferPages: true,
        size: 'A4',
        info: {
          Title: `Forensic Report - ${data.caseItem.case_id}`,
          Author: 'FORENZIQ Digital Forensics Platform',
          Subject: 'Digital Forensic Examination & Technical Findings',
          Keywords: 'Forensics, Incident Response, Cyber Security, Evidence, Audit Trail',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const { caseItem, evidenceList, findingsList, correlationsList, auditLogs } = data;

      // Safe character handling preserving raw Unicode text (including ₹, €, $, £, ¥)
      const safeText = (str: string | undefined | null) => {
        if (!str) return '';
        return str;
      };

      const reportRefNumber = `RPT-${caseItem.case_id.replace(/^CASE-/, '')}-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;
      const generatedAtStr = new Date().toUTCString();
      const leadInvestigator = safeText(caseItem.metadata?.investigator_name || 'Assigned Lead Examiner');

      // Table of Contents section tracking
      const tocEntries: { title: string; pageNumber: number }[] = [];
      const registerSection = (title: string) => {
        const range = doc.bufferedPageRange();
        const currentPage = range.count;
        tocEntries.push({ title, pageNumber: currentPage });
      };

      // Color Palette (Formal Legal Dark Navy / Pure White Pages)
      const COLORS = {
        white: '#FFFFFF',
        navyDark: '#0F172A',     // Headers & Primary Brand
        navyMedium: '#1E293B',   // Subheaders
        textDark: '#334155',     // Body Text
        textMuted: '#64748B',    // Muted Captions & Details
        border: '#E2E8F0',       // Table Dividers
        tableBgHeader: '#F8FAFC',// Table Header Gray
        tableBgAlt: '#F1F5F9',   // Alternating Rows
        accentBlue: '#0284C7',   // Primary Link/Accent
        severityCritical: '#B91C1C', // Dark Red
        severityHigh: '#C2410C',     // Dark Orange
        severityMedium: '#D97706',   // Dark Yellow/Amber
        severityLow: '#15803D',      // Dark Green
      };

      // Helper to ensure sufficient space remains on page before rendering a component
      const ensureSpace = (neededHeight: number) => {
        if (doc.y + neededHeight > 750) {
          doc.addPage();
        }
      };

      // Helper: Section Header
      const drawSectionHeader = (numberStr: string, titleStr: string) => {
        ensureSpace(60);
        const fullTitle = `${numberStr}. ${titleStr}`;
        registerSection(fullTitle);

        doc.moveDown(0.8);
        const y = doc.y;

        // Navy blue line left accent
        doc.rect(45, y, 4, 20).fill(COLORS.navyDark);

        doc.fillColor(COLORS.navyDark)
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(fullTitle, 55, y + 2);

        doc.moveDown(0.8);
        doc.strokeColor(COLORS.border)
           .lineWidth(1)
           .moveTo(45, doc.y)
           .lineTo(550, doc.y)
           .stroke();

        doc.moveDown(0.8);
      };

      // ==========================================
      // PAGE 1: FORMAL COVER PAGE
      // ==========================================
      doc.rect(45, 45, 505, 70).fillAndStroke(COLORS.tableBgHeader, COLORS.border);
      doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(22).text('FORENZIQ', 65, 60);
      doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(10).text('AUTOMATED DIGITAL FORENSICS REPORTER', 65, 88);

      doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(20).text('DIGITAL FORENSIC EXAMINATION REPORT', 45, 150);
      doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(11).text('FORMAL TECHNICAL ANALYSIS & EVIDENCE AUDIT RECORD', 45, 175);

      doc.strokeColor(COLORS.navyDark).lineWidth(2).moveTo(45, 195).lineTo(550, 195).stroke();

      // Case Metadata Block
      const metaY = 220;
      doc.rect(45, metaY, 505, 200).fillAndStroke(COLORS.white, COLORS.border);

      const drawMetaRow = (yPos: number, label1: string, val1: string, label2: string, val2: string) => {
        doc.fillColor(COLORS.textMuted).font('Helvetica-Bold').fontSize(9).text(label1.toUpperCase(), 60, yPos);
        doc.fillColor(COLORS.navyMedium).font('Helvetica').fontSize(10).text(val1, 60, yPos + 12);

        doc.fillColor(COLORS.textMuted).font('Helvetica-Bold').fontSize(9).text(label2.toUpperCase(), 300, yPos);
        doc.fillColor(COLORS.navyMedium).font('Helvetica').fontSize(10).text(val2, 300, yPos + 12);
      };

      drawMetaRow(metaY + 15, 'Case Reference ID', caseItem.case_id, 'Report Reference', reportRefNumber);
      drawMetaRow(metaY + 55, 'Investigation Title', safeText(caseItem.title), 'Case Status', caseItem.status);
      drawMetaRow(metaY + 95, 'Date & Time Generated', generatedAtStr, 'Lead Investigator', leadInvestigator);
      drawMetaRow(metaY + 135, 'Investigating Unit', 'FORENZIQ Cyber Forensic Unit', 'Classification', 'CONFIDENTIAL / RESTRICTED');

      // Confidentiality Notice Box
      const noticeY = 440;
      doc.rect(45, noticeY, 505, 110).fillAndStroke(COLORS.tableBgHeader, COLORS.border);
      doc.fillColor(COLORS.severityCritical).font('Helvetica-Bold').fontSize(10).text('CONFIDENTIALITY & LEGAL NOTICE', 60, noticeY + 15);
      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5).text(
        'This document contains sensitive digital forensic investigation findings, cryptographic hashes, and chain of custody logs. ' +
        'Unauthorized distribution, copying, or dissemination is strictly prohibited. The contents of this report reflect automated ' +
        'cryptographic, optical, and AI-assisted analysis performed under rigorous forensic evidence handling standards.',
        60, noticeY + 32, { width: 475, align: 'justify', lineGap: 3 }
      );

      // Document Control Box
      const ctrlY = 570;
      doc.rect(45, ctrlY, 505, 140).fillAndStroke(COLORS.white, COLORS.border);
      doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text('DOCUMENT CONTROL & INTEGRITY VERIFICATION', 60, ctrlY + 15);

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9);
      doc.text(`• Total Primary Evidence Items: ${evidenceList.length}`, 60, ctrlY + 35);
      doc.text(`• Total Extracted Forensic Findings: ${findingsList.length}`, 60, ctrlY + 50);
      doc.text(`• Cross-Evidence Correlations Identified: ${correlationsList.length}`, 60, ctrlY + 65);
      doc.text(`• Chain of Custody Audit Events Logged: ${auditLogs.length}`, 60, ctrlY + 80);
      doc.text(`• Primary Hashing Algorithm: SHA-256 (256-bit Cryptographic Hash)`, 60, ctrlY + 95);
      doc.text(`• Automated Report Engine: FORENZIQ Core v2.4`, 60, ctrlY + 110);

      // ==========================================
      // PAGE 2: TABLE OF CONTENTS (Placeholder space for Pass 2)
      // ==========================================
      doc.addPage();
      doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(18).text('TABLE OF CONTENTS', 45, 50);
      doc.strokeColor(COLORS.navyDark).lineWidth(1.5).moveTo(45, 75).lineTo(550, 75).stroke();
      doc.moveDown(2);

      const tocPlaceholderY = doc.y;
      doc.y = 700;

      // ==========================================
      // SECTION 1: EXECUTIVE SUMMARY
      // ==========================================
      doc.addPage();
      drawSectionHeader('1', 'Executive Summary');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9.5).text(
        `This forensic report documents the automated examination conducted for Case ${caseItem.case_id} ("${safeText(caseItem.title)}"). ` +
        `The primary objective is to establish evidence integrity, identify suspicious indicators, extract technical entities, ` +
        `and cross-correlate findings across all submitted digital evidence artifacts.`,
        { align: 'justify', lineGap: 3 }
      );
      doc.moveDown(1.2);

      // Executive Summary Metrics Table
      ensureSpace(140);
      const execY = doc.y;
      doc.rect(45, execY, 505, 130).fillAndStroke(COLORS.tableBgHeader, COLORS.border);

      doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text('INVESTIGATION SUMMARY SNAPSHOT', 60, execY + 15);

      const drawExecRow = (yP: number, l1: string, v1: string, l2: string, v2: string) => {
        doc.fillColor(COLORS.textMuted).font('Helvetica-Bold').fontSize(8.5).text(l1, 60, yP);
        doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(v1, 60, yP + 12);

        doc.fillColor(COLORS.textMuted).font('Helvetica-Bold').fontSize(8.5).text(l2, 300, yP);
        doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(v2, 300, yP + 12);
      };

      const criticalCount = findingsList.filter(f => f.severity === 'CRITICAL').length;
      const highCount = findingsList.filter(f => f.severity === 'HIGH').length;

      drawExecRow(execY + 35, 'Case Status', caseItem.status, 'Total Artifacts Examined', `${evidenceList.length} Evidence File(s)`);
      drawExecRow(execY + 70, 'Critical / High Threats', `${criticalCount} Critical | ${highCount} High`, 'Correlated Entity Overlaps', `${correlationsList.length} Match(es)`);

      doc.y = execY + 145;

      // ==========================================
      // SECTION 2: CASE OVERVIEW AND SCOPE
      // ==========================================
      drawSectionHeader('2', 'Case Overview and Scope');

      ensureSpace(50);
      doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(10).text('Case Description & Context:');
      doc.moveDown(0.3);
      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        safeText(caseItem.description) || 'No detailed case description was provided by the investigator at the time of creation.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      ensureSpace(100);
      doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(10).text('Scope of Automated Examination:');
      doc.moveDown(0.3);
      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        '1. Cryptographic hashing (SHA-256) of all uploaded evidence artifacts to establish baseline digital integrity.\n' +
        '2. Multi-provider AI and Optical Character Recognition (OCR) text extraction from screenshots and darknet chat logs.\n' +
        '3. Entity extraction for IP addresses, cryptographic wallet addresses, email addresses, phone numbers, and URLs.\n' +
        '4. Deterministic threat severity analysis based on explicit security rule triggers and contextual risk factors.\n' +
        '5. Pairwise cross-evidence entity correlation matching across independent case evidence items.',
        { lineGap: 3 }
      );
      doc.moveDown(1.5);

      // ==========================================
      // SECTION 3: EVIDENCE INVENTORY & SHA-256
      // ==========================================
      drawSectionHeader('3', 'Evidence Inventory & Cryptographic Verification');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        'All evidence artifacts uploaded to FORENZIQ undergo immediate cryptographic SHA-256 hash calculation upon ingestion. ' +
        'The calculated SHA-256 hash serves as a unique digital fingerprint to ensure anti-tampering verification throughout the investigation lifecycle.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      if (evidenceList.length === 0) {
        ensureSpace(30);
        doc.fillColor(COLORS.textMuted).font('Helvetica-Oblique').fontSize(9.5).text('No evidence items recorded for this case.');
        doc.moveDown(1);
      } else {
        evidenceList.forEach((ev, idx) => {
          ensureSpace(110);

          const startY = doc.y;
          doc.rect(45, startY, 505, 95).fillAndStroke(COLORS.tableBgHeader, COLORS.border);

          doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(
            `Item #${idx + 1}: [${ev.evidence_id}] ${safeText(ev.file_name)}`, 55, startY + 10
          );

          doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5);
          doc.text(`• Type: ${ev.type}`, 55, startY + 28);
          doc.text(`• MIME Type: ${ev.mime_type}`, 180, startY + 28);
          doc.text(`• Size: ${(ev.file_size / 1024).toFixed(2)} KB (${ev.file_size} bytes)`, 330, startY + 28);

          doc.text(`• Source: ${ev.source}`, 55, startY + 43);
          doc.text(`• Ingest Date: ${new Date(ev.uploaded_at).toUTCString()}`, 180, startY + 43);
          doc.text(`• Status: ${ev.analysis_status}`, 380, startY + 43);

          doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(8.5).text('SHA-256 HASH:', 55, startY + 62);
          doc.fillColor(COLORS.accentBlue).font('Courier').fontSize(8).text(ev.sha256_hash, 130, startY + 62, { width: 410 });

          doc.y = startY + 105;

          // Evidence Content Snippet if available (dynamic flow)
          if (ev.metadata?.pasted_text || ev.metadata?.ocr_text) {
            ensureSpace(50);
            const rawTxt = safeText(ev.metadata.pasted_text || ev.metadata.ocr_text);
            doc.fillColor(COLORS.textMuted).font('Helvetica-Bold').fontSize(8).text('EXTRACTED EVIDENCE CONTENT SNIPPET:');
            doc.moveDown(0.2);
            doc.fillColor(COLORS.textDark).font('Courier').fontSize(7.5).text(
              rawTxt.length > 400 ? `${rawTxt.slice(0, 400)}... [TRUNCATED]` : rawTxt,
              { width: 495, align: 'left', lineGap: 2 }
            );
            doc.moveDown(1);
          } else {
            doc.moveDown(0.5);
          }
        });
      }

      // ==========================================
      // SECTION 4: METHODOLOGY & EXAMINATION PROCESS
      // ==========================================
      drawSectionHeader('4', 'Methodology & Technical Examination Process');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        'FORENZIQ implements a multi-tier, deterministic and AI-assisted forensic examination methodology engineered specifically for ' +
        'cybercrime investigations, incident response, and darknet communications analysis.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      const drawMethodStep = (stepNum: string, title: string, desc: string) => {
        ensureSpace(55);
        doc.circle(60, doc.y + 6, 10).fill(COLORS.navyDark);
        doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(9).text(stepNum, 56, doc.y + 2);

        doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(10).text(title, 80, doc.y - 12);
        doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5).text(desc, 80, doc.y + 2, { width: 460, align: 'justify', lineGap: 2 });
        doc.moveDown(1.2);
      };

      drawMethodStep('1', 'Evidence Ingestion & Cryptographic Locking', 'Files are ingested via REST API endpoints, checked against MIME & file-size parameters, and cryptographically hashed with SHA-256 before cloud storage persistence.');
      drawMethodStep('2', 'Optical Character Recognition & Text Normalization', 'Image screenshots undergo OCR scanning via OCR.space engine. Extracted text and chat logs undergo entity normalization for wallet addresses, emails, IPs, and phone numbers.');
      drawMethodStep('3', 'Multi-LLM AI Provider Fallback Cascade', 'Extracted text is evaluated by backend AI providers in deterministic fallback sequence: Groq -> Cerebras -> Gemini -> OpenRouter. Provider keys remain server-side.');
      drawMethodStep('4', 'Deterministic Severity Scoring Rules', 'Scoring engine evaluates contextual triggers (threat terms, credentials, weapons, malware indicators, financial values) to output reproducible risk severity.');
      drawMethodStep('5', 'Pairwise Cross-Evidence Correlation Engine', 'Normalized entities are cross-indexed across all case evidence. Matches meeting confidence criteria generate explicit correlation linkages.');

      // ==========================================
      // SECTION 5: DETAILED FORENSIC FINDINGS
      // ==========================================
      drawSectionHeader('5', 'Detailed Forensic Findings');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        'The following section presents all individual forensic findings extracted during the examination. Each finding displays ' +
        'its unique Finding ID, associated Evidence ID, authoritative severity rating, confidence score, description, and decision reasoning.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      if (findingsList.length === 0) {
        ensureSpace(30);
        doc.fillColor(COLORS.textMuted).font('Helvetica-Oblique').fontSize(9.5).text('No forensic findings recorded for this case.');
        doc.moveDown(1);
      } else {
        findingsList.forEach((fnd, idx) => {
          ensureSpace(120);

          const fndY = doc.y;
          doc.rect(45, fndY, 505, 25).fillAndStroke(COLORS.tableBgHeader, COLORS.border);

          doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(
            `Finding #${idx + 1}: [${fnd.finding_id}] ${safeText(fnd.title)}`, 55, fndY + 7
          );

          // Severity Badge
          let sevColor = COLORS.severityLow;
          if (fnd.severity === 'CRITICAL') sevColor = COLORS.severityCritical;
          if (fnd.severity === 'HIGH') sevColor = COLORS.severityHigh;
          if (fnd.severity === 'MEDIUM') sevColor = COLORS.severityMedium;

          doc.rect(430, fndY + 4, 110, 17).fill(sevColor);
          doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5).text(
            fnd.severity, 430, fndY + 8, { width: 110, align: 'center' }
          );

          doc.y = fndY + 30;

          // Finding Details
          doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5);
          doc.text(`• Associated Evidence ID: ${fnd.evidence_id || 'Case-wide'}`, 55, doc.y);
          doc.text(`• AI Suggested Severity: ${fnd.ai_suggested_severity || 'N/A'}`, 250, doc.y);
          doc.text(`• Confidence Score: ${(fnd.confidence * 100).toFixed(0)}%`, 420, doc.y);
          doc.moveDown(0.6);

          doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(8.5).text('Description:');
          doc.moveDown(0.2);
          doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5).text(
            safeText(fnd.description), { width: 485, align: 'justify', lineGap: 2 }
          );
          doc.moveDown(0.6);

          if (fnd.reasoning) {
            ensureSpace(40);
            doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(8.5).text('Reasoning & Deterministic Evaluation:');
            doc.moveDown(0.2);
            doc.fillColor(COLORS.textDark).font('Helvetica-Oblique').fontSize(8.5).text(
              safeText(fnd.reasoning), { width: 485, align: 'justify', lineGap: 2 }
            );
            doc.moveDown(0.6);
          }

          // Extracted Entities Pill Display if present
          if (fnd.entities && Object.keys(fnd.entities).length > 0) {
            ensureSpace(40);
            doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(8.5).text('Extracted Technical Entities:');
            doc.moveDown(0.2);
            const entStr = Object.entries(fnd.entities)
              .map(([k, v]) => `${k.toUpperCase()}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
            doc.fillColor(COLORS.accentBlue).font('Courier').fontSize(8).text(entStr, { width: 485, lineGap: 2 });
            doc.moveDown(0.6);
          }

          doc.strokeColor(COLORS.border).lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(1);
        });
      }

      // ==========================================
      // SECTION 6: CROSS-EVIDENCE CORRELATION
      // ==========================================
      drawSectionHeader('6', 'Cross-Evidence Correlation Analysis');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        'The correlation engine evaluates extracted entities across independent evidence items within the case workspace to discover ' +
        'shared threat indicators, common email addresses, wallet transactions, IP connections, or usernames.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      if (correlationsList.length === 0) {
        ensureSpace(45);
        const noCorY = doc.y;
        doc.rect(45, noCorY, 505, 45).fillAndStroke(COLORS.tableBgHeader, COLORS.border);
        doc.fillColor(COLORS.textMuted).font('Helvetica-Oblique').fontSize(9.5).text(
          'No cross-evidence correlations were identified by the current analysis.', 60, noCorY + 16
        );
        doc.y = noCorY + 55;
        doc.moveDown(1);
      } else {
        correlationsList.forEach((crl, idx) => {
          ensureSpace(75);

          const crlY = doc.y;
          doc.rect(45, crlY, 505, 65).fillAndStroke(COLORS.tableBgHeader, COLORS.border);

          doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(9.5).text(
            `Correlation #${idx + 1}: [${crl.correlation_id}] Matched Entity: ${safeText(crl.matched_entity_value)} (${crl.matched_entity_type})`,
            55, crlY + 10
          );

          doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5);
          doc.text(`• Source Evidence: ${crl.source_evidence_id}`, 55, crlY + 28);
          doc.text(`• Target Evidence: ${crl.target_evidence_id}`, 280, crlY + 28);
          doc.text(`• Correlation Confidence: ${(crl.confidence * 100).toFixed(0)}%`, 55, crlY + 44);
          doc.text(`• Relationship Reason: ${safeText(crl.reason)}`, 200, crlY + 44, { width: 340 });

          doc.y = crlY + 75;
          doc.moveDown(0.5);
        });
      }

      // ==========================================
      // SECTION 7: CHAIN OF CUSTODY & AUDIT TRAIL
      // ==========================================
      drawSectionHeader('7', 'Chain of Custody & Audit Trail');

      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        'The immutable chain of custody log records all critical case management, evidence upload, AI processing, finding generation, ' +
        'and report creation events in chronological order to provide a verifiable audit trail.',
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1);

      if (auditLogs.length === 0) {
        ensureSpace(30);
        doc.fillColor(COLORS.textMuted).font('Helvetica-Oblique').fontSize(9.5).text('No audit events logged.');
        doc.moveDown(1);
      } else {
        const drawAuditHeader = () => {
          const thY = doc.y;
          doc.rect(45, thY, 505, 20).fillAndStroke(COLORS.navyDark, COLORS.navyDark);
          doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5);
          doc.text('TIMESTAMP (UTC)', 55, thY + 6);
          doc.text('EVENT TYPE', 180, thY + 6);
          doc.text('DESCRIPTION / ACTION', 310, thY + 6);
          doc.y = thY + 22;
        };

        ensureSpace(45);
        drawAuditHeader();

        auditLogs.forEach((log, lIdx) => {
          if (doc.y + 25 > 750) {
            doc.addPage();
            drawAuditHeader();
          }

          const rowY = doc.y;
          const bgCol = lIdx % 2 === 0 ? COLORS.white : COLORS.tableBgHeader;
          doc.rect(45, rowY, 505, 22).fillAndStroke(bgCol, COLORS.border);

          doc.fillColor(COLORS.textDark).font('Courier').fontSize(7.5).text(
            new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19), 52, rowY + 6
          );
          doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(8).text(log.event_type, 180, rowY + 6);
          doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8).text(safeText(log.description), 310, rowY + 6, { width: 230 });

          doc.y = rowY + 22;
        });
        doc.moveDown(1);
      }

      // ==========================================
      // SECTION 8: CONCLUSION AND LIMITATIONS
      // ==========================================
      drawSectionHeader('8', 'Conclusion & Forensic Limitations');

      ensureSpace(60);
      doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(10).text('Summary of Findings:');
      doc.moveDown(0.3);
      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(9).text(
        `The automated forensic examination of Case ${caseItem.case_id} successfully ingested ${evidenceList.length} evidence file(s), ` +
        `generated ${findingsList.length} threat finding(s), and established ${correlationsList.length} entity correlation link(s). ` +
        `All primary evidence items remain verified against original SHA-256 cryptographic baseline hashes.`,
        { align: 'justify', lineGap: 2 }
      );
      doc.moveDown(1.5);

      ensureSpace(110);
      doc.fillColor(COLORS.navyMedium).font('Helvetica-Bold').fontSize(10).text('Important Forensic Limitations & Disclaimers:');
      doc.moveDown(0.3);
      doc.fillColor(COLORS.textDark).font('Helvetica').fontSize(8.5).text(
        '1. AI-Assisted Interpretations: Machine learning and AI vision models provide automated entity extraction and risk suggestions. ' +
        'All AI-generated reasoning should be validated by a certified digital forensics examiner prior to formal legal submission.\n' +
        '2. Scope of Evidence: Findings are strictly bounded by the evidence submitted to the case workspace. ' +
        'The absence of findings does not conclusively prove the absence of malicious activity outside submitted artifacts.\n' +
        '3. Judicial Admissibility: This document serves as an automated technical examination summary. ' +
        'Formal court testimony or expert witness statements require independent forensic review.',
        { align: 'justify', lineGap: 3 }
      );

      // ==========================================
      // PASS 2: HEADERS, FOOTERS & TOC PAGE NUMBERS
      // ==========================================
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        const pageNum = i + 1;

        // Skip Header on Cover Page (Page 1)
        if (pageNum > 1) {
          doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(8);
          doc.text('FORENZIQ – AUTOMATED DIGITAL FORENSICS REPORT', 45, 25);
          doc.text(`CASE ID: ${caseItem.case_id}`, 380, 25, { align: 'right' });
          doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(45, 36).lineTo(550, 36).stroke();
        }

        // Footer on ALL pages
        doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(45, 805).lineTo(550, 805).stroke();
        doc.fillColor(COLORS.textMuted).font('Helvetica').fontSize(8);
        doc.text('CONFIDENTIAL – DIGITAL FORENSIC INVESTIGATION DOCUMENT', 45, 812);
        doc.text(`Page ${pageNum} of ${totalPages}`, 450, 812, { align: 'right' });
      }

      // Populate Table of Contents on Page 2 (index 1)
      doc.switchToPage(1);
      let tocY = tocPlaceholderY;

      tocEntries.forEach((entry) => {
        doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(entry.title, 55, tocY);

        // Dotted leader line
        doc.strokeColor(COLORS.border).lineWidth(0.5).dash(2, { space: 2 });
        doc.moveTo(280, tocY + 8).lineTo(500, tocY + 8).stroke();
        doc.undash();

        doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').fontSize(10).text(
          `Page ${entry.pageNumber}`, 505, tocY, { align: 'right' }
        );

        tocY += 28;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
