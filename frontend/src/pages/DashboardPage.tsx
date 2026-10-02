import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats, Case, Finding } from '../types';
import {
  FolderLock,
  FileCheck2,
  HardDrive,
  AlertTriangle,
  Cpu,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono animate-pulse">Loading forensic metrics...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" /> Metric Retrieval Error
        </h3>
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
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
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Investigation Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">
          Real-time forensic evidence overview and active telemetry.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Cases</span>
            <FolderLock className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 mt-3">{total_cases}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span className="text-emerald-400 font-semibold">{active_cases} Active</span> •{' '}
            <span>{completed_cases} Closed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Evidence Files</span>
            <HardDrive className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 mt-3">{evidence_count}</div>
          <p className="text-xs text-slate-400 mt-2">Images, Logs & Text Evidences</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Findings Total</span>
            <FileCheck2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 mt-3">{findings_count}</div>
          <p className="text-xs text-slate-400 mt-2">Generated Forensic Artifacts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Critical / High</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-3">
            {severity_breakdown.CRITICAL + severity_breakdown.HIGH}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span className="text-red-400 font-semibold">{severity_breakdown.CRITICAL} Critical</span> •{' '}
            <span className="text-orange-400">{severity_breakdown.HIGH} High</span>
          </div>
        </div>
      </div>

      {/* AI Provider Telemetry */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-200">Active AI Fallback Pipeline</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Groq', 'Cerebras', 'Gemini', 'OpenRouter'].map((p) => {
            const isConfigured = configured_ai_providers.includes(p);
            return (
              <span
                key={p}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  isConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
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
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100">Recent Case Workspace</h3>
            <Link to="/cases" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recent_cases.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
              No cases initialized yet. Create your first case.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_cases.map((c: Case) => (
                <Link
                  key={c.id}
                  to={`/cases/${c.case_id}`}
                  className="block p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{c.case_id}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200 mt-1">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.description || 'No description provided.'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Findings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100">Recent Forensic Findings</h3>
            <span className="text-xs text-slate-400 font-mono">Live Persisted</span>
          </div>

          {recent_findings.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
              No findings analyzed yet. Upload evidence in a case to trigger AI analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_findings.map((f: Finding) => (
                <div key={f.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : f.severity === 'HIGH'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-800'
                          : f.severity === 'MEDIUM'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{f.finding_id}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 mt-2 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{f.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
