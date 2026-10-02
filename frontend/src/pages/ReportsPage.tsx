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
    <div className="space-y-6 pb-8">
      {/* Glass Header */}
      <div className="astra-glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Forensic Report Repository</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Persisted court-ready PDF reports across all forensic cases.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 font-semibold text-sm animate-pulse">Loading report repository...</div>
      ) : reports.length === 0 ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 text-xs">
          No reports generated yet. Generate reports directly inside a Case Workspace.
        </div>
      ) : (
        <div className="space-y-4 font-mono text-xs">
          {reports.map((rpt) => (
            <div key={rpt.id} className="astra-glass-card p-5 flex items-center justify-between">
              <div>
                <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {rpt.report_id}
                </span>
                <h4 className="font-sans font-bold text-slate-800 dark:text-slate-100 mt-2 text-sm">{rpt.file_name}</h4>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Created: {new Date(rpt.created_at).toUTCString()}
                </span>
              </div>

              <a
                href={`/api/reports/${rpt.report_id}?download=true`}
                target="_blank"
                rel="noreferrer"
                className="astra-btn-primary text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
