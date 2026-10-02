import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

// Mock supabase client calls to avoid external network requirements during route tests
vi.mock('../utils/supabaseClient.js', () => {
  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === 'cases') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '11111111-1111-1111-1111-111111111111',
                case_id: 'CASE-12345678',
                title: 'Test Case',
                description: 'Test Description',
                status: 'OPEN',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
        if (table === 'evidence') {
          return {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: '22222222-2222-2222-2222-222222222222',
                evidence_id: 'CHAT-12345678',
                case_id: '11111111-1111-1111-1111-111111111111',
                type: 'CHAT',
                file_name: 'chat.txt',
                file_path: 'CASE-12345678/CHAT-12345678_chat.txt',
                file_size: 100,
                mime_type: 'text/plain',
                sha256_hash: 'a'.repeat(64),
                uploaded_at: new Date().toISOString(),
                analysis_status: 'PENDING',
              },
              error: null,
            }),
          };
        }
        if (table === 'findings') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
          };
        }
        return {};
      }),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
          download: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      },
    },
  };
});

describe('API Routes', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/cases should validate and create a new case', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        title: 'Investigation Alpha',
        description: 'Analyzing suspicious transactions',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.case_id).toBe('CASE-12345678');
  });

  it('POST /api/cases should reject invalid input', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        title: '', // Empty title
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid request payload');
  });

  it('POST /api/cases/:caseId/evidence should upload pasted chat evidence', async () => {
    const res = await request(app)
      .post('/api/cases/CASE-12345678/evidence')
      .send({
        text_content: 'Suspect: Meet at 12:00 near the vault.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.evidence_id).toBe('CHAT-12345678');
  });
});
