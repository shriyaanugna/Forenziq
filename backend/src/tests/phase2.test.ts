import { describe, it, expect, vi } from 'vitest';
import { normalizeEntity } from '../utils/entityNormalizer.js';
import { CorrelationEngine } from '../services/correlationEngine.js';
import { AuditService } from '../services/auditService.js';

// Mock supabase client calls
vi.mock('../utils/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'findings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'f1',
                case_id: 'c1',
                evidence_id: 'ev1',
                entities: {
                  emails: ['JOHN.DOE@EXAMPLE.COM'],
                  phone_numbers: ['+1 (555) 019-2834'],
                },
              },
              {
                id: 'f2',
                case_id: 'c1',
                evidence_id: 'ev2',
                entities: {
                  emails: ['john.doe@example.com'],
                  phone_numbers: ['555-019-2834'],
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
                  id: 'crl-1',
                  correlation_id: 'CRL-12345678',
                  case_id: 'c1',
                  source_evidence_id: 'ev1',
                  target_evidence_id: 'ev2',
                  matched_entity_type: 'emails',
                  matched_entity_value: 'JOHN.DOE@EXAMPLE.COM',
                  confidence: 0.95,
                  reason: 'Exact match',
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
              single: vi.fn().mockResolvedValue({
                data: { id: 'a1', event_id: 'AUD-12345678', event_type: 'CASE_CREATED' },
                error: null,
              }),
            }),
          }),
          select: vi.fn().mockReturnThis(),
        };
      }
      return {};
    }),
  },
}));

describe('Entity Normalization', () => {
  it('should normalize emails to lowercase', () => {
    const norm = normalizeEntity('email', 'JOHN.DOE@EXAMPLE.COM ');
    expect(norm.normalized).toBe('john.doe@example.com');
  });

  it('should normalize phone numbers by stripping formatting characters', () => {
    const norm = normalizeEntity('phone_number', '+1 (555) 019-2834');
    expect(norm.normalized).toBe('+15550192834');
  });

  it('should normalize URLs removing protocol and trailing slash', () => {
    const norm = normalizeEntity('url', 'https://www.badsite.com/phish/ ');
    expect(norm.normalized).toBe('badsite.com/phish');
  });
});

describe('Correlation Engine', () => {
  it('should detect cross-evidence correlation between matching normalized entities', async () => {
    const engine = new CorrelationEngine();
    const correlations = await engine.correlateCase('c1');

    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0].matched_entity_value).toBe('JOHN.DOE@EXAMPLE.COM');
    expect(correlations[0].confidence).toBeGreaterThanOrEqual(0.85);
  });
});

describe('Audit Service', () => {
  it('should log audit event successfully', async () => {
    const log = await AuditService.logEvent({
      caseId: 'c1',
      eventType: 'CASE_CREATED',
      description: 'Test case created.',
    });
    expect(log).not.toBeNull();
    expect(log?.event_type).toBe('CASE_CREATED');
  });
});
