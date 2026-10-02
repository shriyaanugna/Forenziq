import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import findingsRouter from '../routes/findings.js';
import { generatePDFReport } from '../services/reportGenerator.js';
import { Case, Evidence, Finding, Correlation, AuditLog } from '../types/index.js';

vi.mock('../services/ai/AIService.js', () => {
  return {
    AIService: vi.fn().mockImplementation(() => ({
      analyzeText: vi.fn().mockResolvedValue({
        finding_type: 'SECURITY_THREAT',
        title: 'Potential Security Breach on Workstation WS-104',
        description: 'Analyzed suspicious text activity',
        suggested_severity: 'HIGH',
        confidence: 0.9,
        reasoning: 'Rule trigger',
        entities: { user: ['admin'] },
        indicators: ['password_leak'],
        raw_provider: 'mock-provider',
      }),
      analyzeImage: vi.fn(),
    })),
  };
});

vi.mock('../services/ocrService.js', () => {
  return {
    OCRService: vi.fn().mockImplementation(() => ({
      extractText: vi.fn().mockResolvedValue({ text: 'Sample text' }),
    })),
  };
});

vi.mock('../services/correlationEngine.js', () => {
  return {
    CorrelationEngine: vi.fn().mockImplementation(() => ({
      correlateCase: vi.fn().mockResolvedValue([]),
    })),
  };
});

vi.mock('../utils/supabaseClient.js', () => {
  const mockSingle = vi.fn().mockResolvedValue({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      evidence_id: 'IMG-9F3A1D7C',
      case_id: '22222222-2222-2222-2222-222222222222',
      type: 'CHAT',
      file_name: 'chat_log.txt',
      file_path: 'evidence/chat_log.txt',
      metadata: { pasted_text: 'Threat statement with credential leak user:admin pass:123456' },
    },
    error: null,
  });

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'cases') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: '22222222-2222-2222-2222-222222222222', case_id: 'CASE-12345678' },
              error: null,
            }),
          }),
        }),
      };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '33333333-3333-3333-3333-333333333333',
              finding_id: 'FND-748A508F',
              title: 'Potential Security Breach on Workstation WS-104',
              severity: 'CRITICAL',
              confidence: 0.95,
            },
            error: null,
          }),
        }),
      }),
    };
  });

  return {
    supabase: {
      from: mockFrom,
      storage: {
        from: vi.fn().mockReturnValue({
          download: vi.fn().mockResolvedValue({
            data: new Blob(['Sample chat log'], { type: 'text/plain' }),
            error: null,
          }),
        }),
      },
    },
  };
});

describe('Re-analyse & PDF Layout Engine Tests', () => {
  it('POST /api/evidence/:evidenceId/analyze and /api/cases/:caseId/evidence/:evidenceId/analyze respond 200', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', findingsRouter);

    const res1 = await request(app).post('/api/evidence/IMG-9F3A1D7C/analyze');
    expect(res1.status).toBe(200);
    expect(res1.body.data.finding.finding_id).toBe('FND-748A508F');

    const res2 = await request(app).post('/api/cases/CASE-12345678/evidence/IMG-9F3A1D7C/analyze');
    expect(res2.status).toBe(200);
    expect(res2.body.data.finding.finding_id).toBe('FND-748A508F');
  });

  it('generatePDFReport creates a valid PDF buffer with long finding titles without layout errors', async () => {
    const mockCase: Case = {
      id: '22222222-2222-2222-2222-222222222222',
      case_id: 'CASE-748A508F',
      title: 'Investigation into Workstation Compromise WS-104',
      description: 'Extensive forensic examination of compromised workstation WS-104 and associated network logs.',
      status: 'OPEN',
      investigator_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockEvidence: Evidence[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        evidence_id: 'IMG-9F3A1D7C',
        case_id: mockCase.id,
        type: 'IMAGE',
        file_name: 'workstation_desktop_screenshot_ws104_full_hd_resolution_2025.png',
        file_path: 'evidence/workstation_desktop_screenshot.png',
        file_size: 1048576,
        mime_type: 'image/png',
        sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        source: 'FILE_UPLOAD',
        uploaded_at: new Date().toISOString(),
        analysis_status: 'COMPLETED',
      },
    ];

    const mockFindings: Finding[] = [
      {
        id: '33333333-3333-3333-3333-333333333333',
        finding_id: 'FND-748A508F',
        case_id: mockCase.id,
        evidence_id: mockEvidence[0].id,
        finding_type: 'EXPLOIT_DETECTED',
        title: 'Finding #1: [FND-748A508F] Potential Security Breach on Workstation WS-104 with Critical System Command Execution',
        description: 'Detected unauthorized remote administration tool execution attempt alongside credential dumping commands targeting Domain Admin tokens.',
        severity: 'CRITICAL',
        confidence: 0.98,
        reasoning: 'Exploit signature matched meterpreter payload staging routine in memory dump.',
        entities: { ip_addresses: ['192.168.1.105'], usernames: ['admin_root'] },
        indicators: [
          { type: 'EXPLOIT', value: 'mimikatz', context: 'Credential dumper' },
          { type: 'EXPLOIT', value: 'psexec', context: 'Remote exec' },
        ],
        created_at: new Date().toISOString(),
      },
    ];

    const mockCorrelations: Correlation[] = [
      {
        id: '44444444-4444-4444-4444-444444444444',
        correlation_id: 'CRL-1001',
        case_id: mockCase.id,
        source_evidence_id: mockEvidence[0].id,
        target_evidence_id: mockEvidence[0].id,
        correlation_type: 'ENTITY_MATCH',
        matched_entity_type: 'IP_ADDRESS',
        matched_entity_value: '192.168.1.105',
        confidence: 0.95,
        reason: 'Shared IP address detected across workstation logs and network pcap captures.',
        created_at: new Date().toISOString(),
      },
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '55555555-5555-5555-5555-555555555555',
        event_id: 'AUD-001',
        case_id: mockCase.id,
        event_type: 'EVIDENCE_ANALYZED',
        description: 'AI analysis completed for evidence IMG-9F3A1D7C.',
        created_at: new Date().toISOString(),
      },
    ];

    const pdfBuffer = await generatePDFReport({
      caseItem: mockCase,
      evidenceList: mockEvidence,
      findingsList: mockFindings,
      correlationsList: mockCorrelations,
      auditLogs: mockAuditLogs,
    });

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});
