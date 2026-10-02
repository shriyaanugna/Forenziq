import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats, Case, Finding } from '../types';
import { useAuth } from '../context/AuthContext';
import Lock3DHero from '../components/Lock3DHero';
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
  TrendingUp,
  ShieldCheck
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
      <div className="astra-glass-card p-12 text-slate-500 dark:text-sky-300 font-semibold text-sm animate-pulse text-center">
        Loading forensic intelligence & security telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="astra-glass-card p-6 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300">
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
      {/* Hero Welcome Glass Card with Integrated 3D Animated Lock */}
      <div className="astra-glass-card p-6 sm:p-8 relative overflow-hidden dark:bg-[#0B1426]/90 dark:border-sky-900/50">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-cyan-500/20 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Welcome Info Side */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-400 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-sky-500/30 shrink-0">
                {firstName.charAt(0)}
              </div>
              <div>
                <div className="astra-pill-badge bg-cyan-100/80 text-cyan-800 dark:bg-sky-950/80 dark:text-cyan-300 dark:border dark:border-sky-800/60">
                  <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  <span>{timeGreeting}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                  Welcome, <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">{firstName}</span>
                </h1>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Automated Digital Forensics Intelligence Workspace. Cryptographic hash verification, multi-provider AI analysis, and forensic findings engine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/cases/new" className="astra-btn-primary text-xs">
                <span>+ Initialize New Case</span>
              </Link>
              <div className="astra-pill-badge bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SHA-256 Vault Secure</span>
              </div>
            </div>
          </div>

          {/* 3D Custom Animated Lock Hero Canvas */}
          <div className="lg:col-span-5 h-64 sm:h-72 w-full rounded-2xl bg-slate-900/10 dark:bg-[#050B18]/90 border border-cyan-500/30 dark:border-sky-500/30 overflow-hidden relative shadow-inner">
            <Lock3DHero compact={true} />
          </div>
        </div>
      </div>

      {/* Primary KPI Glass Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Cases */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01] dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cases</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{total_cases}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border dark:border-emerald-800/60">
                <TrendingUp className="w-3 h-3" /> {active_cases} Active
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{completed_cases} Closed</span>
            </div>
          </div>
        </div>

        {/* Evidence Files */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01] dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Evidence Vault</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-100 dark:bg-sky-950/80 text-cyan-600 dark:text-cyan-400 border dark:border-sky-800/50 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{evidence_count}</div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Images, Chats & Text Logs</p>
          </div>
        </div>

        {/* Total Findings */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01] dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Findings</span>
            <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-indigo-950/80 text-violet-600 dark:text-indigo-400 border dark:border-indigo-800/50 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{findings_count}</div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">AI & Deterministic Artifacts</p>
          </div>
        </div>

        {/* Critical Threat Indicator */}
        <div className="astra-glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.01] dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">High / Critical</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border dark:border-rose-800/50 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {severity_breakdown.CRITICAL + severity_breakdown.HIGH}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="astra-pill-badge bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border dark:border-rose-800/60">
                {severity_breakdown.CRITICAL} Critical
              </span>
              <span className="astra-pill-badge bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border dark:border-amber-800/60">
                {severity_breakdown.HIGH} High
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pipeline Status Bar */}
      <div className="astra-glass-card p-5 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-sky-400" />
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
                    : 'bg-slate-100/80 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
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
        <div className="astra-glass-card p-6 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Active Cases</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cases under active forensic investigation</p>
            </div>
            <Link to="/cases" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent_cases.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200/80 dark:border-sky-900/40 rounded-2xl text-slate-400 text-xs">
              No cases initialized yet. Start by initializing a new forensic case.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_cases.map((c: Case) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.case_id}`}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 hover:bg-white dark:hover:bg-[#0e192f] border border-white/80 dark:border-sky-900/40 shadow-sm hover:shadow transition-all block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                      {c.case_id}
                    </span>
                    <span className="astra-pill-badge bg-cyan-50 text-cyan-700 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50">
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
        <div className="astra-glass-card p-6 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Artifact Findings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extracted suspicious indicators and severity alerts</p>
            </div>
            <span className="astra-pill-badge bg-cyan-50 text-cyan-700 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50">
              Live Persisted
            </span>
          </div>

          {recent_findings.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200/80 dark:border-sky-900/40 rounded-2xl text-slate-400 text-xs">
              No findings recorded yet. Upload evidence to run automated AI analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_findings.map((f: Finding) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`astra-pill-badge ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border dark:border-rose-800/60'
                          : f.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border dark:border-amber-800/60'
                          : f.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border dark:border-amber-800/50'
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
