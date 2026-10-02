import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../services/api';
import { FolderPlus, AlertCircle, ShieldAlert } from 'lucide-react';

export default function NewCasePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [investigatorName, setInvestigatorName] = useState('Lead Investigator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Case title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCase = await createCase({
        title: title.trim(),
        description: description.trim(),
        investigator_name: investigatorName.trim(),
      });
      navigate(`/cases/${newCase.case_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header Glass Card */}
      <div className="astra-glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FolderPlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Initialize Forensic Case Container</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create an isolated forensic investigation workspace for evidence tracking and AI telemetry.
          </p>
        </div>
      </div>

      {error && (
        <div className="astra-glass-card p-4 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Glass Card */}
      <form onSubmit={handleSubmit} className="astra-glass-card p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Case Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operation CyberVault - Insider Threat Inquiry"
            className="w-full px-4 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Lead Investigator / Agency
          </label>
          <input
            type="text"
            value={investigatorName}
            onChange={(e) => setInvestigatorName(e.target.value)}
            placeholder="e.g. Det. Alex Rivera / Digital Forensics Unit"
            className="w-full px-4 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Investigation Overview & Objectives
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed overview of the incident, target accounts, or key objective..."
            className="w-full p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Generates immutable UUID and CASE-XXXXXXXX ID</span>
          </div>

          <button type="submit" disabled={loading} className="astra-btn-primary text-xs">
            {loading ? 'Initializing Case...' : 'Create Case Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}
