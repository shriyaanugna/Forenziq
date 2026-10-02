import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

// Mock Supabase client
vi.mock('../utils/supabaseClient.js', () => {
  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return {
            upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'cases') {
          return {
            insert: vi.fn().mockImplementation((payload: any) => {
              if (payload.title === 'FK Error Test') {
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: null,
                      error: { code: '23503', message: 'insert or update on table "cases" violates foreign key constraint "cases_investigator_id_fkey"' },
                    }),
                  }),
                };
              }
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: '11111111-1111-1111-1111-111111111111',
                      case_id: 'CASE-99999999',
                      title: payload.title,
                      description: payload.description,
                      investigator_id: payload.investigator_id,
                      status: 'OPEN',
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              };
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'uuid-1' }, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    },
  };
});

describe('Case Creation Foreign Key Safeguards', () => {
  it('creates case successfully when investigator user is valid', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        title: 'Operation Blue Shield',
        description: 'Forensic audit of encrypted vault',
        investigator_name: 'Agent Smith',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Operation Blue Shield');
  });

  it('handles foreign key constraint 23503 error gracefully', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        title: 'FK Error Test',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INVESTIGATOR_REFERENCE');
    expect(res.body.error.message).toContain('Invalid investigator ID provided');
  });
});
