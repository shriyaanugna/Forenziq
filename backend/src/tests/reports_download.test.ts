import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import reportsRouter from '../routes/reports.js';

vi.mock('../utils/supabaseClient.js', () => {
  const mockSingle = vi.fn().mockResolvedValue({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      report_id: 'RPT-12345678',
      case_id: '22222222-2222-2222-2222-222222222222',
      file_name: 'FORENZIQ_Report_RPT-12345678.pdf',
      storage_path: 'reports/RPT-12345678.pdf',
    },
    error: null,
  });

  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    }),
  });

  const mockDownload = vi.fn().mockResolvedValue({
    data: new Blob(['PDF CONTENT DUMMY'], { type: 'application/pdf' }),
    error: null,
  });

  const mockStorageFrom = vi.fn().mockReturnValue({
    download: mockDownload,
  });

  return {
    supabase: {
      from: mockFrom,
      storage: {
        from: mockStorageFrom,
      },
    },
  };
});

describe('Reports API Download Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', reportsRouter);
  });

  it('GET /api/reports/:reportId?download=true returns binary PDF stream', async () => {
    const res = await request(app).get('/api/reports/RPT-12345678?download=true');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment; filename="FORENZIQ_Report_RPT-12345678.pdf"');
  });
});
