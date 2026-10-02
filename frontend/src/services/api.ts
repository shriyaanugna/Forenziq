import { Case, Evidence, Finding, DashboardStats, Correlation, AuditLog, Report } from '../types';
import { supabase } from '../lib/supabase';

export const DEFAULT_PRODUCTION_BACKEND_URL = 'https://forenziq-backend.onrender.com';

export const getApiBase = (): string => {
  let rawUrl = import.meta.env.VITE_API_URL || '';

  const isBrowser = typeof window !== 'undefined';
  const isNonLocalhost = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Safety guard: if running in browser on non-localhost domain, ignore localhost API URL
  if (isNonLocalhost) {
    if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
      rawUrl = '';
    }
  }

  if (!rawUrl || rawUrl.trim() === '') {
    if (isNonLocalhost) {
      // In production browser deployment without explicit VITE_API_URL, default to deployed backend origin
      rawUrl = DEFAULT_PRODUCTION_BACKEND_URL;
    } else {
      // In local development or node environment, fall back to relative /api (proxied by Vite)
      return '/api';
    }
  }

  const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

export function getReportDownloadUrl(reportId: string): string {
  return `${getApiBase()}/reports/${reportId}?download=true`;
}

async function getAuthHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { ...customHeaders };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/dashboard/stats`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch dashboard metrics');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCases(): Promise<Case[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch cases');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCase(caseId: string): Promise<Case> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch case details');
  }
  const json = await res.json();
  return json.data;
}

export async function createCase(payload: { title: string; description: string; investigator_name?: string }): Promise<Case> {
  const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create case');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseEvidence(caseId: string): Promise<Evidence[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function uploadEvidence(caseId: string, formData: FormData): Promise<Evidence> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function analyzeEvidence(evidenceId: string, caseId?: string): Promise<{ finding: Finding; evidence_status: string }> {
  const headers = await getAuthHeaders();
  const endpoint = caseId
    ? `${API_BASE}/cases/${caseId}/evidence/${evidenceId}/analyze`
    : `${API_BASE}/evidence/${evidenceId}/analyze`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to analyze evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseFindings(caseId: string): Promise<Finding[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/findings`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch findings');
  }
  const json = await res.json();
  return json.data;
}

// Phase 2 API helpers
export async function triggerCorrelationScan(caseId: string): Promise<Correlation[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/correlations`, { method: 'POST', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to trigger correlation scan');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseCorrelations(caseId: string): Promise<Correlation[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/correlations`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch correlations');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseAuditTrail(caseId: string): Promise<AuditLog[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/audit`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch audit trail');
  }
  const json = await res.json();
  return json.data;
}

export async function generateReport(caseId: string): Promise<Report> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/reports`, { method: 'POST', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to generate report');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseReports(caseId: string): Promise<Report[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/cases/${caseId}/reports`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch case reports');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchAllReports(): Promise<Report[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/reports`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list reports');
  }
  const json = await res.json();
  return json.data;
}
