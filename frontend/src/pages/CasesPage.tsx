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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <FolderLock className="w-7 h-7 text-slate-900 dark:text-cyan-400" /> Forensic Case Directory
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Browse and manage active digital forensic investigations.
          </p>
        </div>

        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Initialize New Case
        </Link>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Case ID, Title, or Description..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-cyan-500 text-sm shadow-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 font-mono animate-pulse">
          Fetching forensic cases...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-500/30 rounded-xl text-rose-800 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="py-16 text-center bg-white/80 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <FolderLock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">No Forensic Cases Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            {search ? 'No cases match your search query.' : 'Initialize a new case to start collecting evidence.'}
          </p>
          {!search && (
            <Link
              to="/cases/new"
              className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Create New Case Now <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              to={`/cases/${c.case_id}`}
              className="group bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-cyan-400 bg-slate-100 dark:bg-cyan-950/60 px-2.5 py-1 rounded border border-slate-200 dark:border-cyan-800/40">
                    {c.case_id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      c.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mt-3 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {c.description || 'No detailed case summary provided.'}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {c.metadata?.investigator_name || 'Investigator'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
