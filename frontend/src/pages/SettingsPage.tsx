import React from 'react';
import { Settings as SettingsIcon, Cpu, ShieldCheck, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-slate-900 dark:text-cyan-400" /> Platform Settings & Provider Telemetry
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          View environment configuration and backend AI service provider status.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <Cpu className="w-4 h-4 text-slate-900 dark:text-cyan-400" /> Configured AI Fallback Pipeline
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-semibold">Groq AI (Llama 3.3 70B Versatile)</span>
              <span className="text-slate-500 dark:text-slate-400">Backend Fallback Rank #1</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-semibold">Cerebras AI (Llama 3.1 70B High Speed)</span>
              <span className="text-slate-500 dark:text-slate-400">Backend Fallback Rank #2</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-semibold">Google Gemini (Gemini 1.5 Flash Vision & Text)</span>
              <span className="text-slate-500 dark:text-slate-400">Backend Fallback Rank #3</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span className="font-semibold">OpenRouter AI (Multi-Model Gateway)</span>
              <span className="text-slate-500 dark:text-slate-400">Backend Fallback Rank #4</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <Database className="w-4 h-4 text-slate-900 dark:text-cyan-400" /> Database & Storage Cluster
          </h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs space-y-1">
            <p className="text-slate-900 dark:text-slate-300 font-bold">Supabase PostgreSQL & Supabase Storage</p>
            <p className="text-slate-500">Target Host: yydnhzyoeehkurbatgqi.supabase.co</p>
            <p className="text-slate-500">Storage Buckets: evidence, reports</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Security Notice: AI provider API credentials are handled exclusively on the backend server and never sent to or exposed in the browser environment.</span>
        </div>
      </div>
    </div>
  );
}
