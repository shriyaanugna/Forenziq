import { describe, it, expect } from 'vitest';
import { generatePDFReport } from '../services/reportGenerator.js';

describe('PDFkit Forensic Report Generator', () => {
  it('should generate non-empty PDF report buffer with currency rendering', async () => {
    const mockData = {
      caseItem: {
        id: '11111111-1111-1111-1111-111111111111',
        case_id: 'CASE-12345678',
        title: 'Operation Fraud ₹25,000',
        description: 'Forensic evaluation of ₹25,000, €25,000, $25,000, £25,000 transfers',
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
          file_path: 'CASE-12345678/IMG-9F3A1D7C_screenshot.png',
          file_size: 1024,
          mime_type: 'image/png',
          sha256_hash: 'a'.repeat(64),
          source: 'FILE_UPLOAD',
          uploaded_at: new Date().toISOString(),
          analysis_status: 'COMPLETED' as const,
          metadata: { ocr_text: 'Transfer ₹25,000 or €25,000 immediately' },
        },
      ],
      findingsList: [
        {
          id: '33333333-3333-3333-3333-333333333333',
          finding_id: 'FND-87654321',
          case_id: '11111111-1111-1111-1111-111111111111',
          evidence_id: '22222222-2222-2222-2222-222222222222',
          finding_type: 'FINANCIAL_FRAUD',
          title: 'Illicit Transfer Demand ₹25,000',
          description: 'Demanded ₹25,000 / $25,000 / €25,000',
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

    const pdfBuffer = await generatePDFReport(mockData);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });
});
