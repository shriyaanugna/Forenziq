import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { fetchCases, fetchCaseEvidence } from '../services/api';
import { Evidence } from '../types';

export default function ChatsPage() {
  const [chats, setChats] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      try {
        const cases = await fetchCases();
        const allEvidences = await Promise.all(cases.map((c) => fetchCaseEvidence(c.case_id)));
        const flattened = allEvidences.flat().filter((e) => e.type === 'CHAT' || e.type === 'TEXT');
        setChats(flattened);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Glass Header */}
      <div className="astra-glass-card p-6 flex items-center gap-4 dark:bg-[#0B1426]/90 dark:border-sky-900/40">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-sky-950/80 text-indigo-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center shrink-0">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Chat & Text Evidence Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Catalog of all uploaded chat logs, TXT, CSV, JSON, and pasted text evidence across cases.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 font-semibold text-sm animate-pulse dark:bg-[#0B1426]/90 dark:border-sky-900/40">Scanning chat vault...</div>
      ) : chats.length === 0 ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 text-xs dark:bg-[#0B1426]/90 dark:border-sky-900/40">
          No chat or text evidence items stored yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <div key={chat.id} className="astra-glass-card p-5 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="astra-pill-badge bg-indigo-100 text-indigo-800 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50">
                  {chat.evidence_id}
                </span>
                <span className="astra-pill-badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {chat.source}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{chat.file_name}</h4>
              <p className="text-[11px] font-mono text-slate-400 truncate">SHA-256: {chat.sha256_hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
