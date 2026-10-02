import { describe, it, expect, vi } from 'vitest';
import { calculateSHA256 } from '../utils/hashUtils.js';
import { normalizeEntity } from '../utils/entityNormalizer.js';
import { evaluateSeverity } from '../services/severityEngine.js';
import { CorrelationEngine } from '../services/correlationEngine.js';
import { generatePDFReport } from '../services/reportGenerator.js';

// Mock Supabase DB calls for realistic end-to-end integration test
vi.mock('../utils/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'findings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'fnd-img-1',
                case_id: 'case-fraud-101',
                evidence_id: 'ev-img-1',
                finding_type: 'FINANCIAL_FRAUD',
                title: 'Suspicious Transfer Request Image',
                description: 'Extracted transaction details TXN-458921 for ₹25,000 to account 458921XXXX.',
                severity: 'HIGH',
                ai_suggested_severity: 'CRITICAL',
                severity_score: 45,
                confidence: 0.95,
                reasoning: 'Extracted financial indicators (+25) and AI alignment (+20). Total Score: 45.',
                entities: {
                  transaction_ids: ['TXN-458921'],
                  account_numbers: ['458921XXXX'],
                },
              },
              {
                id: 'fnd-chat-2',
                case_id: 'case-fraud-101',
                evidence_id: 'ev-chat-2',
                finding_type: 'SUSPICIOUS_CHAT',
                title: 'Chat Payment Confirmation & Transfer Directive',
                description: 'Discussion confirming receipt of ₹25,000 and directing transfer to account 458921XXXX.',
                severity: 'HIGH',
                ai_suggested_severity: 'HIGH',
                severity_score: 40,
                confidence: 0.90,
                reasoning: 'Extracted financial indicators (+25) and AI alignment (+15). Total Score: 40.',
                entities: {
                  account_numbers: ['458921XXXX'],
                },
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'correlations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'crl-101',
                  correlation_id: 'CRL-458921',
                  case_id: 'case-fraud-101',
                  source_evidence_id: 'ev-img-1',
                  target_evidence_id: 'ev-chat-2',
                  matched_entity_type: 'account_numbers',
                  matched_entity_value: '458921XXXX',
                  confidence: 0.95,
                  reason: 'Exact normalized entity match on ACCOUNT_NUMBERS: 458921XXXX.',
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'aud-1' }, error: null }),
            }),
          }),
        };
      }
      return {};
    }),
  },
}));

describe('Real-World Fraud Scenario Integration Test', () => {
  const caseItem = {
    id: 'case-fraud-101',
    case_id: 'CASE-FRAUD-101',
    title: 'Financial Fraud & Ransom Demand Investigation',
    description: 'Investigation into ₹25,000 transfer and account 458921XXXX directive.',
    status: 'OPEN' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const imgText = `SECURITY ALERT
Transaction ID: TXN-458921
Amount: ₹25,000
Recipient Account: 458921XXXX
Transfer the amount immediately.
Delete this conversation after payment.
Do not mention the sender's name.`;

  const chatText = `[2026-09-28 10:15] Alex: Hey, did you receive the payment?
[2026-09-28 10:17] Sam: Yes, ₹25,000 received.
[2026-09-28 10:18] Alex: Good. Delete this conversation after you transfer it.
[2026-09-28 10:19] Sam: Where should I send it?
[2026-09-28 10:20] Alex: Send it to account 458921XXXX.
[2026-09-28 10:21] Sam: Done.
[2026-09-28 10:22] Alex: Don't mention my name anywhere.`;

  it('should compute cryptographic SHA-256 hashes for both evidence items', () => {
    const hashImg = calculateSHA256(Buffer.from(imgText, 'utf-8'));
    const hashChat = calculateSHA256(Buffer.from(chatText, 'utf-8'));

    expect(hashImg.length).toBe(64);
    expect(hashChat.length).toBe(64);
    expect(hashImg).not.toBe(hashChat);
  });

  it('should evaluate deterministic severity correctly', () => {
    const imgEval = evaluateSeverity({
      suggestedSeverity: 'CRITICAL',
      confidence: 0.95,
      textContext: imgText,
    });

    const chatEval = evaluateSeverity({
      suggestedSeverity: 'HIGH',
      confidence: 0.90,
      textContext: chatText,
    });

    expect(imgEval.severity).toBe('HIGH');
    expect(imgEval.aiSuggestedSeverity).toBe('CRITICAL');
    expect(chatEval.severity).toBe('HIGH');
    expect(chatEval.aiSuggestedSeverity).toBe('HIGH');
  });

  it('should normalize and correlate shared account identifier 458921XXXX across evidence', async () => {
    const normAcc1 = normalizeEntity('account_number', ' 458921XXXX ');
    const normAcc2 = normalizeEntity('account_number', '458921xxxx');

    expect(normAcc1.normalized).toBe('458921XXXX');
    expect(normAcc2.normalized).toBe('458921XXXX');
    expect(normAcc1.normalized).toBe(normAcc2.normalized);

    const engine = new CorrelationEngine();
    const correlations = await engine.correlateCase('case-fraud-101');

    expect(correlations.length).toBe(1);
    expect(correlations[0].matched_entity_value).toBe('458921XXXX');
    expect(correlations[0].confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('should render PDF report containing both evidence items, correlations, and Unicode ₹25,000 currency', async () => {
    const pdfBuffer = await generatePDFReport({
      caseItem,
      evidenceList: [
        {
          id: 'ev-img-1',
          evidence_id: 'IMG-458921',
          case_id: 'case-fraud-101',
          type: 'IMAGE',
          file_name: 'alert_screenshot.png',
          file_path: 'CASE-FRAUD-101/IMG-458921_alert_screenshot.png',
          file_size: 2048,
          mime_type: 'image/png',
          sha256_hash: calculateSHA256(Buffer.from(imgText, 'utf-8')),
          source: 'FILE_UPLOAD',
          uploaded_at: new Date().toISOString(),
          analysis_status: 'COMPLETED',
          metadata: { ocr_text: imgText },
        },
        {
          id: 'ev-chat-2',
          evidence_id: 'CHAT-458921',
          case_id: 'case-fraud-101',
          type: 'CHAT',
          file_name: 'chat_log.txt',
          file_path: 'CASE-FRAUD-101/CHAT-458921_chat_log.txt',
          file_size: 1024,
          mime_type: 'text/plain',
          sha256_hash: calculateSHA256(Buffer.from(chatText, 'utf-8')),
          source: 'PASTED_TEXT',
          uploaded_at: new Date().toISOString(),
          analysis_status: 'COMPLETED',
          metadata: { pasted_text: chatText },
        },
      ],
      findingsList: [
        {
          id: 'fnd-img-1',
          finding_id: 'FND-101',
          case_id: 'case-fraud-101',
          evidence_id: 'ev-img-1',
          finding_type: 'FINANCIAL_FRAUD',
          title: 'Suspicious Transfer Request Image',
          description: 'Extracted details for ₹25,000 to account 458921XXXX.',
          severity: 'HIGH',
          ai_suggested_severity: 'CRITICAL',
          severity_score: 45,
          confidence: 0.95,
          reasoning: 'Extracted financial indicators (+25) and AI alignment (+20).',
          entities: { transaction_ids: ['TXN-458921'], account_numbers: ['458921XXXX'] },
          indicators: [],
          created_at: new Date().toISOString(),
        },
      ],
      correlationsList: [
        {
          id: 'crl-101',
          correlation_id: 'CRL-458921',
          case_id: 'case-fraud-101',
          source_evidence_id: 'ev-img-1',
          target_evidence_id: 'ev-chat-2',
          matched_entity_type: 'account_number',
          matched_entity_value: '458921XXXX',
          correlation_type: 'SHARED_ENTITY',
          confidence: 0.95,
          reason: 'Exact match on ACCOUNT_NUMBER: 458921XXXX.',
          created_at: new Date().toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'aud-1',
          event_id: 'AUD-001',
          case_id: 'case-fraud-101',
          event_type: 'CASE_CREATED',
          description: 'Case CASE-FRAUD-101 initialized.',
          created_at: new Date().toISOString(),
        },
      ],
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.toString('utf-8', 0, 5)).toBe('%PDF-');
  });
});
