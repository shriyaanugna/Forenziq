import React from 'react';
import { FileText, Lock } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <FileText className="w-7 h-7 text-cyan-400" /> Forensic Report Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Court-ready forensic PDF export and executive reporting module.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center max-w-xl mx-auto space-y-4">
        <Lock className="w-12 h-12 text-cyan-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-100">Phase 2 Module</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Forensic PDF Report Generation and cross-case correlation exports will be activated in Phase 2.
          All findings and severity calculations in Phase 1 are saved and formatted to support seamless report export.
        </p>
      </div>
    </div>
  );
}
