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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <FolderPlus className="w-7 h-7 text-cyan-400" /> Initialize Forensic Case
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Create a globally unique forensic case container for chain of custody and evidence tracking.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
            Case Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operation CyberVault - Insider Threat Investigation"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
            Lead Investigator / Agency
          </label>
          <input
            type="text"
            value={investigatorName}
            onChange={(e) => setInvestigatorName(e.target.value)}
            placeholder="e.g. Det. Alex Rivera / Cyber Crime Unit"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
            Investigation Summary & Scope
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the incident, affected assets, and scope of inquiry..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Generates immutable UUID and CASE-XXXXXXXX prefix</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Initializing Case...' : 'Create Case Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
}
