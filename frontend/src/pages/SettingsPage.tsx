import React from 'react';
import { Settings as SettingsIcon, Cpu, ShieldCheck, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl pb-8">
      {/* Glass Header */}
      <div className="astra-glass-card p-6 flex items-center gap-4 dark:bg-[#0B1426]/90 dark:border-sky-900/40">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center shrink-0">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Platform Configuration & Provider Telemetry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System health, backend AI service provider fallback ranks, and secure database connections.
          </p>
        </div>
      </div>

      <div className="astra-glass-card p-8 space-y-8 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider mb-4">
            <Cpu className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Configured AI Provider Fallback Chain
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-bold">Groq AI (Llama 3.3 70B Versatile)</span>
              <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50">Rank #1</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-bold">Cerebras AI (Llama 3.1 70B High Speed)</span>
              <span className="astra-pill-badge bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border dark:border-indigo-800/50">Rank #2</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-bold">Google Gemini (Gemini 1.5 Flash Vision & Text)</span>
              <span className="astra-pill-badge bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 dark:border dark:border-violet-800/50">Rank #3</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-bold">OpenRouter AI (Multi-Model Gateway)</span>
              <span className="astra-pill-badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Rank #4</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/50 dark:border-sky-900/30">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider mb-4">
            <Database className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Database & Storage Telemetry
          </h3>
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40 font-mono text-xs space-y-1">
            <p className="text-slate-900 dark:text-white font-bold">Supabase PostgreSQL & Supabase Storage</p>
            <p className="text-slate-500 dark:text-slate-400">Target Host: yydnhzyoeehkurbatgqi.supabase.co</p>
            <p className="text-slate-500 dark:text-slate-400">Storage Buckets: evidence, reports</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/50 dark:border-sky-900/30 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Security Guarantee: AI API credentials are secured strictly in backend environment variables and never logged or sent to the browser client.</span>
        </div>
      </div>
    </div>
  );
}
