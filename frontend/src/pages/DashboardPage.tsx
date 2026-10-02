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
  Sun,
  Moon,
  CloudSun,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Dynamically extracts a clean, natural first name from email addresses
 * e.g., 'shriyaanugna@gmail.com' -> 'Shriya', 'rahul.kumar@outlook.com' -> 'Rahul'
 */
export function extractFirstName(email?: string, displayName?: string): string {
  if (displayName && displayName.trim().length > 0) {
    const parts = displayName.trim().split(/\s+/);
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }

  if (!email || !email.includes('@')) {
    return 'Investigator';
  }

  const localPart = email.split('@')[0];
  // Remove numbers and special characters or split on separators
  const nameCandidate = localPart
    .split(/[._\-\d]+/)[0]
    .replace(/[^a-zA-Z]/g, '');

  if (nameCandidate.length === 0) {
    return 'Investigator';
  }

  return nameCandidate.charAt(0).toUpperCase() + nameCandidate.slice(1).toLowerCase();
}

/**
 * Calculates a dynamic local time greeting (e.g. Good Morning, Good Afternoon)
 */
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
      <div className="p-8 text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono animate-pulse">
        Loading forensic metrics and security telemetry...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/40 dark:bg-rose-950/40 light:bg-rose-50 border border-rose-500/30 light:border-rose-200 rounded-2xl text-rose-300 dark:text-rose-300 light:text-rose-800 shadow-sm">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 dark:text-rose-400 light:text-rose-600" /> Metric Retrieval Error
        </h3>
        <p className="mt-2 text-sm text-rose-400/80 dark:text-rose-400/80 light:text-rose-700">{error}</p>
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
    <div className="space-y-8">
      {/* Personalized Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 light:from-white/90 light:via-white/80 light:to-slate-50/90 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-xl light:shadow-slate-200/50 backdrop-blur-xl relative overflow-hidden transition-all">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-slate-900 light:text-white border border-cyan-500/20 dark:border-cyan-500/20 light:border-slate-800 text-cyan-400 dark:text-cyan-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{timeGreeting}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 light:from-slate-900 light:to-blue-700">{firstName}</span>!
            </h1>

            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mt-1">
              Here's an overview of your active digital forensic investigations and security telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/cases/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>+ Initialize New Case</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider">Total Cases</span>
            <FolderLock className="w-5 h-5 text-cyan-400 dark:text-cyan-400 light:text-slate-900" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 mt-3">{total_cases}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">
            <span className="text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-semibold">{active_cases} Active</span> •{' '}
            <span>{completed_cases} Closed</span>
          </div>
        </div>

        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider">Evidence Files</span>
            <HardDrive className="w-5 h-5 text-blue-400 dark:text-blue-400 light:text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 mt-3">{evidence_count}</div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">Images, Logs & Text Evidences</p>
        </div>

        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider">Findings Total</span>
            <FileCheck2 className="w-5 h-5 text-purple-400 dark:text-purple-400 light:text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 mt-3">{findings_count}</div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">Generated Forensic Artifacts</p>
        </div>

        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider">Critical / High</span>
            <ShieldAlert className="w-5 h-5 text-rose-400 dark:text-rose-400 light:text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 dark:text-rose-400 light:text-rose-600 mt-3">
            {severity_breakdown.CRITICAL + severity_breakdown.HIGH}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">
            <span className="text-rose-400 dark:text-rose-400 light:text-rose-600 font-semibold">{severity_breakdown.CRITICAL} Critical</span> •{' '}
            <span className="text-amber-400 dark:text-amber-400 light:text-amber-600">{severity_breakdown.HIGH} High</span>
          </div>
        </div>
      </div>

      {/* AI Provider Telemetry */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-5 rounded-2xl shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-3">
          <Cpu className="w-5 h-5 text-cyan-400 dark:text-cyan-400 light:text-slate-900" />
          <h3 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900">Active AI Fallback Pipeline</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Groq', 'Cerebras', 'Gemini', 'OpenRouter'].map((p) => {
            const isConfigured = configured_ai_providers.includes(p);
            return (
              <span
                key={p}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  isConfigured
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border-emerald-500/30 dark:border-emerald-500/30 light:border-emerald-200'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-500 dark:text-slate-500 light:text-slate-400 border-slate-700 dark:border-slate-700 light:border-slate-200'
                }`}
              >
                {p} {isConfigured ? '✓ Active' : '✗ Unconfigured'}
              </span>
            );
          })}
        </div>
      </div>

      {/* Recent Cases & Recent Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Cases */}
        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-6 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">Recent Case Workspace</h3>
            <Link to="/cases" className="text-xs text-cyan-400 dark:text-cyan-400 light:text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recent_cases.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-xl text-slate-500 dark:text-slate-500 light:text-slate-400 text-sm">
              No cases initialized yet. Create your first case.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_cases.map((c: Case) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.case_id}`}
                  className="block p-4 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50/80 border border-slate-800 dark:border-slate-800 light:border-slate-200/80 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 light:hover:border-slate-400 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400 dark:text-cyan-400 light:text-slate-900">{c.case_id}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900 mt-1">{c.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 line-clamp-1">{c.description || 'No description provided.'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Findings */}
        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/80 light:backdrop-blur-md border border-slate-800 dark:border-slate-800 light:border-slate-200/80 p-6 rounded-2xl shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">Recent Forensic Findings</h3>
            <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-mono">Live Persisted</span>
          </div>

          {recent_findings.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-xl text-slate-500 dark:text-slate-500 light:text-slate-400 text-sm">
              No findings analyzed yet. Upload evidence in a case to trigger AI analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_findings.map((f: Finding) => (
                <div key={f.id} className="p-4 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50/80 border border-slate-800 dark:border-slate-800 light:border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-950/80 dark:bg-rose-950/80 light:bg-rose-100 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-800 light:border-rose-200'
                          : f.severity === 'HIGH'
                          ? 'bg-amber-950/80 dark:bg-amber-950/80 light:bg-amber-100 text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-800 light:border-amber-200'
                          : f.severity === 'MEDIUM'
                          ? 'bg-amber-950/60 dark:bg-amber-950/60 light:bg-amber-50 text-amber-300 dark:text-amber-300 light:text-amber-800 border border-amber-800 light:border-amber-200'
                          : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-500 light:text-slate-500">{f.finding_id}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900 mt-2 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 line-clamp-2">{f.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
