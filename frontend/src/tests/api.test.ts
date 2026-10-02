import { describe, it, expect, afterEach } from 'vitest';
import { getApiBase, DEFAULT_PRODUCTION_BACKEND_URL } from '../services/api';

describe('API Base Resolution', () => {
  const originalEnv = import.meta.env.VITE_API_URL;

  afterEach(() => {
    (import.meta.env as any).VITE_API_URL = originalEnv;
  });

  it('resolves relative /api in local dev when VITE_API_URL is empty', () => {
    (import.meta.env as any).VITE_API_URL = '';
    expect(getApiBase()).toBe('/api');
  });

  it('resolves custom API URL when provided and clean', () => {
    (import.meta.env as any).VITE_API_URL = 'https://forenziq-backend.onrender.com';
    expect(getApiBase()).toBe('https://forenziq-backend.onrender.com/api');
  });

  it('appends /api exactly once if raw URL already contains /api', () => {
    (import.meta.env as any).VITE_API_URL = 'https://forenziq-backend.onrender.com/api';
    expect(getApiBase()).toBe('https://forenziq-backend.onrender.com/api');
  });
});
