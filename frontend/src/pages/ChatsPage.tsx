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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-cyan-400" /> Chat & Text Vault
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Catalog of all uploaded chat logs, text files, and pasted text evidence across cases.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-slate-400 font-mono animate-pulse">Scanning chat vault...</div>
      ) : chats.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-xl text-slate-500">
          No chat or text evidence items stored yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <div key={chat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-cyan-400 font-bold">{chat.evidence_id}</span>
                <span className="text-slate-500">{chat.source}</span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm truncate">{chat.file_name}</h4>
              <p className="text-[11px] font-mono text-slate-500 truncate mt-1">Hash: {chat.sha256_hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
