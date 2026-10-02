import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { fetchAllReports } from '../services/api';
import { Report } from '../types';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports()
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <FileText className="w-7 h-7 text-slate-900 dark:text-cyan-400" /> Forensic Report Center
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Persisted court-ready forensic PDF reports across all cases.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-slate-500 dark:text-slate-400 font-mono animate-pulse">Loading report repository...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-2 text-slate-500 dark:text-slate-500 shadow-sm">
          No reports generated yet. Generate reports directly inside a Case Workspace.
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs max-w-4xl">
          {reports.map((rpt) => (
            <div
              key={rpt.id}
              className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm"
            >
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{rpt.report_id}</span>
                <h4 className="font-sans font-semibold text-slate-900 dark:text-slate-200 mt-1 text-sm">{rpt.file_name}</h4>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Created: {new Date(rpt.created_at).toUTCString()}
                </span>
              </div>

              <a
                href={`/api/reports/${rpt.report_id}?download=true`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
