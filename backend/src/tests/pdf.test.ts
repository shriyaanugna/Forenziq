import { describe, it, expect } from 'vitest';
import { generatePDFReport } from '../services/reportGenerator.js';

describe('PDFkit Forensic Report Generator Dynamic Pagination', () => {
  it('should generate a valid PDF for a small case with 1 evidence item and 1 finding', async () => {
    const smallCase = {
      caseItem: {
        id: '11111111-1111-1111-1111-111111111111',
        case_id: 'CASE-SMALL-001',
        title: 'Small Fraud Test ₹10,000',
        description: 'Small investigation test for dynamic PDF pagination',
        status: 'OPEN' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      evidenceList: [
        {
          id: '22222222-2222-2222-2222-222222222222',
          evidence_id: 'IMG-9F3A1D7C',
          case_id: '11111111-1111-1111-1111-111111111111',
          type: 'IMAGE' as const,
          file_name: 'screenshot.png',
          file_path: 'CASE-SMALL-001/IMG-9F3A1D7C_screenshot.png',
          file_size: 1024,
          mime_type: 'image/png',
          sha256_hash: 'a'.repeat(64),
          source: 'FILE_UPLOAD',
          uploaded_at: new Date().toISOString(),
          analysis_status: 'COMPLETED' as const,
          metadata: { ocr_text: 'Transfer ₹10,000 or €10,000 immediately' },
        },
      ],
      findingsList: [
        {
          id: '33333333-3333-3333-3333-333333333333',
          finding_id: 'FND-87654321',
          case_id: '11111111-1111-1111-1111-111111111111',
          evidence_id: '22222222-2222-2222-2222-222222222222',
          finding_type: 'FINANCIAL_FRAUD',
          title: 'Illicit Transfer Demand ₹10,000',
          description: 'Demanded ₹10,000 / $10,000 / €10,000',
          severity: 'HIGH' as const,
          ai_suggested_severity: 'CRITICAL' as const,
          severity_score: 45,
          confidence: 0.92,
          reasoning: 'AI suggested CRITICAL, deterministic score assigned HIGH.',
          entities: { emails: ['admin@target.com'] },
          indicators: [],
          created_at: new Date().toISOString(),
        },
      ],
      correlationsList: [],
      auditLogs: [],
    };

    const pdfBuffer = await generatePDFReport(smallCase);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });

  it('should generate a large multi-page PDF dynamically for complex cases with 20+ evidence items and 25+ findings', async () => {
    const caseId = 'CASE-LARGE-999';
    const evidenceList = Array.from({ length: 25 }, (_, i) => ({
      id: `ev-${i}`,
      evidence_id: `IMG-${1000 + i}`,
      case_id: 'large-case-uuid',
      type: 'IMAGE' as const,
      file_name: `exfiltrated_screenshot_${i}.png`,
      file_path: `CASE-LARGE-999/IMG-${1000 + i}.png`,
      file_size: 51200 + i * 1024,
      mime_type: 'image/png',
      sha256_hash: `${i.toString(16)}`.padStart(64, 'e'),
      source: 'FILE_UPLOAD',
      uploaded_at: new Date().toISOString(),
      analysis_status: 'COMPLETED' as const,
      metadata: { ocr_text: `Extracted OCR content for screenshot item ${i} containing suspicious transaction wallet 0x${i}abc...` },
    }));

    const findingsList = Array.from({ length: 25 }, (_, i) => ({
      id: `fnd-${i}`,
      finding_id: `FND-${5000 + i}`,
      case_id: 'large-case-uuid',
      evidence_id: `ev-${i}`,
      finding_type: 'MALWARE_INDICATOR',
      title: `Suspicious Darknet Wallet Transaction #${i}`,
      description: `Detailed technical description of malware artifact #${i} with exfiltration activity to IP 192.168.1.${i}.`,
      severity: i % 2 === 0 ? ('CRITICAL' as const) : ('HIGH' as const),
      ai_suggested_severity: 'CRITICAL' as const,
      severity_score: 85,
      confidence: 0.95,
      reasoning: `Deterministic evaluation rule #${i} triggered based on threat intelligence threshold match.`,
      entities: { ip_addresses: [`192.168.1.${i}`], crypto_addresses: [`0x${i}abcde123456789`] },
      indicators: [],
      created_at: new Date().toISOString(),
    }));

    const auditLogs = Array.from({ length: 40 }, (_, i) => ({
      id: `log-${i}`,
      event_id: `AUD-${8000 + i}`,
      case_id: 'large-case-uuid',
      event_type: 'EVIDENCE_ANALYZED' as const,
      description: `Audit log entry #${i}: Evidence IMG-${1000 + (i % 25)} successfully processed by AI engine.`,
      created_at: new Date(Date.now() - i * 60000).toISOString(),
    }));

    const largeCase = {
      caseItem: {
        id: 'large-case-uuid',
        case_id: caseId,
        title: 'Complex Multi-Node Cyber Espionage & Ransomware Investigation',
        description: 'Comprehensive investigation involving 25 exfiltrated artifacts, 25 critical findings, and 40 chronological custody log records.',
        status: 'IN_PROGRESS' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      evidenceList,
      findingsList,
      correlationsList: [
        {
          id: 'crl-1',
          correlation_id: 'CRL-7771',
          case_id: 'large-case-uuid',
          source_evidence_id: 'IMG-1000',
          target_evidence_id: 'IMG-1005',
          matched_entity_type: 'IP_ADDRESS',
          matched_entity_value: '192.168.1.1',
          correlation_type: 'SHARED_ENTITY',
          confidence: 0.98,
          reason: 'Matching C2 IP address discovered across independent evidence screenshots.',
          created_at: new Date().toISOString(),
        },
      ],
      auditLogs,
    };

    const pdfBuffer = await generatePDFReport(largeCase);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    // Large case report should be significantly larger in byte size due to 10+ generated pages
    expect(pdfBuffer.length).toBeGreaterThan(25000);
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });
});
