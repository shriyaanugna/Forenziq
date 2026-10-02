import { Case, Evidence, Finding, DashboardStats } from '../types';

const API_BASE = '/api';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch dashboard metrics');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch cases');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCase(caseId: string): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch case details');
  }
  const json = await res.json();
  return json.data;
}

export async function createCase(payload: { title: string; description: string; investigator_name?: string }): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function uploadEvidence(caseId: string, formData: FormData): Promise<Evidence> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function analyzeEvidence(evidenceId: string): Promise<{ finding: Finding; evidence_status: string }> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to analyze evidence');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchCaseFindings(caseId: string): Promise<Finding[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/findings`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch findings');
  }
  const json = await res.json();
  return json.data;
}
