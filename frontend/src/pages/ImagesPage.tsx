import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { fetchCases, fetchCaseEvidence } from '../services/api';
import { Evidence } from '../types';

export default function ImagesPage() {
  const [images, setImages] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        const cases = await fetchCases();
        const allEvidences = await Promise.all(cases.map((c) => fetchCaseEvidence(c.case_id)));
        const flattened = allEvidences.flat().filter((e) => e.type === 'IMAGE');
        setImages(flattened);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadImages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-slate-900 dark:text-cyan-400" /> Image Evidence Vault
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Catalog of all uploaded JPEG, PNG, and WEBP evidence across cases.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-slate-500 dark:text-slate-400 font-mono animate-pulse">Scanning image vault...</div>
      ) : images.length === 0 ? (
        <div className="py-16 text-center bg-white/80 dark:bg-slate-900 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-500 shadow-sm">
          No image evidence items stored yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-900 dark:text-cyan-400 font-bold">{img.evidence_id}</span>
                <span className="text-slate-500">{img.mime_type}</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{img.file_name}</h4>
              <p className="text-[11px] font-mono text-slate-500 truncate mt-1">Hash: {img.sha256_hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
