import { describe, it, expect } from 'vitest';
import { generatePDFReport } from '../services/reportGenerator.js';

describe('PDFkit Forensic Report Generator', () => {
  it('should generate non-empty PDF report buffer', async () => {
    const mockData = {
      caseItem: {
        id: '11111111-1111-1111-1111-111111111111',
        case_id: 'CASE-12345678',
        title: 'Operation CyberGuard',
        description: 'Forensic evaluation of compromised assets',
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
        },
      ],
      findingsList: [
        {
          id: '33333333-3333-3333-3333-333333333333',
          finding_id: 'FND-87654321',
          case_id: '11111111-1111-1111-1111-111111111111',
          evidence_id: '22222222-2222-2222-2222-222222222222',
          finding_type: 'CREDENTIAL_LEAK',
          title: 'Exposed API Token',
          description: 'High-entropy secret token identified in text.',
          severity: 'HIGH' as const,
          confidence: 0.92,
          reasoning: 'Matches known OAuth pattern.',
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
    // PDF magic bytes check (%PDF-)
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });
});
