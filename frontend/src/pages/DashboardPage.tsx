import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats, Case, Finding } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FolderLock,
  FileCheck2,
  HardDrive,
  AlertTriangle,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function extractFirstName(email?: string, displayName?: string): string {
  if (displayName && displayName.trim().length > 0) {
    const parts = displayName.trim().split(/\s+/);
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }

  if (!email || !email.includes('@')) {
    return 'Investigator';
  }

  const localPart = email.split('@')[0];
  const nameCandidate = localPart
    .split(/[._\-\d]+/)[0]
    .replace(/[^a-zA-Z]/g, '');

  if (nameCandidate.length === 0) {
    return 'Investigator';
  }

  return nameCandidate.charAt(0).toUpperCase() + nameCandidate.slice(1).toLowerCase();
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = extractFirstName(user?.email, user?.name);
  const timeGreeting = getTimeOfDayGreeting();

  if (loading) {
    return (
      <div className="astra-glass-card p-12 text-slate-500 dark:text-slate-400 font-semibold text-sm animate-pulse text-center">
        Loading forensic intelligence & security telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="astra-glass-card p-6 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
        <h3 className="font-bold flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /> Metric Retrieval Error
        </h3>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-400/80">{error}</p>
      </div>
    );
  }

  const {
    total_cases,
    active_cases,
    completed_cases,
    evidence_count,
    findings_count,
    severity_breakdown,
    recent_cases,
    recent_findings,
    configured_ai_providers,
  } = stats!;

  return (
    <div className="space-y-6 pb-8">
      {/* Personalized Welcome Glass Header */}
      <div className="astra-glass-card p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30 shrink-0">
              {firstName.charAt(0)}
            </div>
            <div>
              <div className="astra-pill-badge bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{timeGreeting}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                Here is your automated digital forensics intelligence command center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/cases/new" className="astra-btn-primary text-xs">
              <span>+ Initialize New Case</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Glass Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Cases */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cases</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{total_cases}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <TrendingUp className="w-3 h-3" /> {active_cases} Active
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{completed_cases} Closed</span>
            </div>
          </div>
        </div>

        {/* Evidence Files */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Evidence Vault</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{evidence_count}</div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Images, Chats & Text Logs</p>
          </div>
        </div>

        {/* Total Findings */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Findings</span>
            <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{findings_count}</div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">AI & Deterministic Artifacts</p>
          </div>
        </div>

        {/* Critical Threat Indicator */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">High / Critical</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {severity_breakdown.CRITICAL + severity_breakdown.HIGH}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="astra-pill-badge bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                {severity_breakdown.CRITICAL} Critical
              </span>
              <span className="astra-pill-badge bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {severity_breakdown.HIGH} High
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pipeline Status Bar */}
      <div className="astra-glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Multi-AI Provider Fallback Engine</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Groq → Cerebras → Gemini → OpenRouter</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {['Groq', 'Cerebras', 'Gemini', 'OpenRouter'].map((p) => {
            const isConfigured = configured_ai_providers.includes(p);
            return (
              <span
                key={p}
                className={`astra-pill-badge ${
                  isConfigured
                    ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-100/80 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isConfigured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{p}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Recent Workspace & Findings Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="astra-glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Active Cases</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cases under active forensic investigation</p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent_cases.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              No cases initialized yet. Start by initializing a new forensic case.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_cases.map((c: Case) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.case_id}`}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-white/80 dark:border-slate-700/60 shadow-sm hover:shadow transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      {c.case_id}
                    </span>
                    <span className="astra-pill-badge bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-2">{c.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {c.description || 'No description provided.'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Findings */}
        <div className="astra-glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Artifact Findings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extracted suspicious indicators and severity alerts</p>
            </div>
            <span className="astra-pill-badge bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Live Persisted
            </span>
          </div>

          {recent_findings.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              No findings recorded yet. Upload evidence to run automated AI analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_findings.map((f: Finding) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`astra-pill-badge ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : f.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : f.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{f.finding_id}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-2">{f.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{f.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
