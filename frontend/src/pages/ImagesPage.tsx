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
    <div className="space-y-6 pb-8">
      {/* Glass Header */}
      <div className="astra-glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Image Evidence Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Catalog of all uploaded JPG, PNG, and WEBP evidence across cases.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 font-semibold text-sm animate-pulse">Scanning image vault...</div>
      ) : images.length === 0 ? (
        <div className="astra-glass-card p-12 text-center text-slate-400 text-xs">
          No image evidence items stored yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="astra-glass-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                  {img.evidence_id}
                </span>
                <span className="astra-pill-badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {img.mime_type}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{img.file_name}</h4>
              <p className="text-[11px] font-mono text-slate-400 truncate">SHA-256: {img.sha256_hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
