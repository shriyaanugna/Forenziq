import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCases } from '../services/api';
import { Case } from '../types';
import { FolderLock, Plus, Search, Calendar, User, ArrowRight } from 'lucide-react';

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases()
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Glass Top Header */}
      <div className="astra-glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-[#0B1426]/90 dark:border-sky-900/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Forensic Case Workspace</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Browse and manage active digital forensic investigation directories.
              </p>
            </div>
          </div>
        </div>

        <Link to="/cases/new" className="astra-btn-primary text-xs shrink-0">
          <Plus className="w-4 h-4" /> Initialize New Case
        </Link>
      </div>

      {/* Search Filter Pill */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cases by Case ID, Title, or Description..."
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/80 dark:bg-[#070e1e]/80 backdrop-blur-md border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm transition-all"
        />
      </div>

      {loading ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 font-semibold text-sm animate-pulse dark:bg-[#0B1426]/90 dark:border-sky-900/40">
          Retrieving forensic cases...
        </div>
      ) : error ? (
        <div className="astra-glass-card p-6 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="astra-glass-card p-12 text-center dark:bg-[#0B1426]/90 dark:border-sky-900/40">
          <FolderLock className="w-12 h-12 text-slate-300 dark:text-sky-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Forensic Cases Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {search ? 'No cases match your search query.' : 'Initialize a new case to start collecting evidence.'}
          </p>
          {!search && (
            <Link to="/cases/new" className="astra-btn-primary text-xs inline-flex mt-4">
              Create New Case Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              to={`/cases/${c.case_id}`}
              className="astra-glass-card p-6 flex flex-col justify-between hover:scale-[1.01] transition-all group dark:bg-[#0B1426]/85 dark:border-sky-900/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50 font-mono text-[11px]">
                    {c.case_id}
                  </span>
                  <span
                    className={`astra-pill-badge ${
                      c.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mt-4 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {c.description || 'No detailed case summary provided.'}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200/50 dark:border-sky-900/30 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {c.metadata?.investigator_name || 'Investigator'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
