import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCase, fetchCaseEvidence, fetchCaseFindings, uploadEvidence, analyzeEvidence } from '../services/api';
import { Case, Evidence, Finding } from '../types';
import {
  FolderLock,
  UploadCloud,
  FileText,
  ShieldAlert,
  Cpu,
  Hash,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'FINDINGS'>('EVIDENCE');

  // Upload modal/drawer state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis state tracking per evidence ID
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const loadData = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const [c, ev, fnd] = await Promise.all([
        fetchCase(caseId),
        fetchCaseEvidence(caseId),
        fetchCaseFindings(caseId),
      ]);
      setCaseItem(c);
      setEvidenceList(ev);
      setFindingsList(fnd);
    } catch (err: any) {
      setError(err.message || 'Failed to load case workspace');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !pastedText.trim()) {
      setUploadError('Please select a file or enter pasted chat text.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (pastedText.trim()) {
        formData.append('text_content', pastedText.trim());
      }

      await uploadEvidence(caseId!, formData);
      setShowUploadModal(false);
      setSelectedFile(null);
      setPastedText('');
      await loadData();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerAnalysis = async (evidenceId: string) => {
    setAnalyzingIds((prev) => ({ ...prev, [evidenceId]: true }));
    try {
      await analyzeEvidence(evidenceId);
      await loadData();
    } catch (err: any) {
      alert(`AI Analysis Failed: ${err.message}`);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [evidenceId]: false }));
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono animate-pulse">Initializing case workspace...</div>;
  }

  if (error || !caseItem) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" /> Workspace Error
        </h3>
        <p className="mt-2 text-sm text-red-400/80">{error || 'Case not found'}</p>
        <Link to="/cases" className="inline-block mt-4 text-xs font-bold text-cyan-400 hover:underline">
          &larr; Return to Cases List
        </Link>
      </div>
    );
  }

  // Summary severity badges calculation
  const criticalCount = findingsList.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findingsList.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findingsList.filter((f) => f.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-extrabold text-cyan-400 bg-cyan-950 px-3 py-1 rounded border border-cyan-800">
                {caseItem.case_id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {caseItem.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-2">{caseItem.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{caseItem.description || 'No description provided.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" /> Add Evidence
            </button>
          </div>
        </div>

        {/* Workspace Quick Severity Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Total Evidence</span>
            <span className="text-lg font-bold text-slate-200 mt-0.5 block">{evidenceList.length} Items</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Critical Threats</span>
            <span className="text-lg font-bold text-red-400 mt-0.5 block">{criticalCount} Findings</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">High Risk</span>
            <span className="text-lg font-bold text-orange-400 mt-0.5 block">{highCount} Findings</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Medium Risk</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">{mediumCount} Findings</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-slate-800">
        <button
          onClick={() => setActiveTab('EVIDENCE')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'EVIDENCE'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" /> Evidence Vault ({evidenceList.length})
        </button>
        <button
          onClick={() => setActiveTab('FINDINGS')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'FINDINGS'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> AI Forensic Findings ({findingsList.length})
        </button>
      </div>

      {/* EVIDENCE TAB CONTENT */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-4">
          {evidenceList.length === 0 ? (
            <div className="py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-xl">
              <UploadCloud className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300">No Evidence Uploaded</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Upload image screenshots or text/chat logs to calculate SHA-256 and initiate AI analysis.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/20"
              >
                Upload Evidence Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {evidenceList.map((ev) => {
                const isAnalyzing = analyzingIds[ev.id];
                return (
                  <div
                    key={ev.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-cyan-400">
                        {ev.type === 'IMAGE' ? <ImageIcon className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-cyan-400">{ev.evidence_id}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {ev.mime_type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {(ev.file_size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-100 mt-1">{ev.file_name}</h4>

                        {/* Cryptographic SHA-256 Hash Display */}
                        <div className="flex items-center gap-1 mt-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 max-w-fit">
                          <Hash className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="text-slate-500">SHA-256:</span>
                          <span className="truncate max-w-[280px] md:max-w-md">{ev.sha256_hash}</span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Action Button */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        {ev.analysis_status === 'COMPLETED' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Analyzed
                          </span>
                        ) : ev.analysis_status === 'FAILED' ? (
                          <span className="text-red-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Failed
                          </span>
                        ) : ev.analysis_status === 'ANALYZING' || isAnalyzing ? (
                          <span className="text-cyan-400 flex items-center gap-1 animate-pulse">
                            <Clock className="w-4 h-4" /> Processing...
                          </span>
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleTriggerAnalysis(ev.id)}
                        disabled={isAnalyzing || ev.analysis_status === 'ANALYZING'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {ev.analysis_status === 'COMPLETED' ? 'Re-Analyze' : 'Run AI Analysis'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FINDINGS TAB CONTENT */}
      {activeTab === 'FINDINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            {findingsList.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                No findings generated yet. Trigger AI analysis on an uploaded evidence item.
              </div>
            ) : (
              findingsList.map((fnd) => (
                <div
                  key={fnd.id}
                  onClick={() => setSelectedFinding(fnd)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedFinding?.id === fnd.id
                      ? 'bg-slate-900 border-cyan-500 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        fnd.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : fnd.severity === 'HIGH'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-800'
                          : fnd.severity === 'MEDIUM'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {fnd.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{fnd.finding_id}</span>
                  </div>

                  <h4 className="font-semibold text-slate-100 text-sm mt-2">{fnd.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fnd.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Finding Detail Panel */}
          <div className="md:col-span-2">
            {!selectedFinding ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Select a finding from the list to view detailed extracted entities and contextual reasoning.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{selectedFinding.finding_id}</span>
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: {(selectedFinding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">{selectedFinding.title}</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{selectedFinding.description}</p>
                </div>

                {/* Reasoning */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Deterministic Severity & AI Reasoning:
                  </span>
                  <p className="whitespace-pre-wrap font-mono leading-relaxed">{selectedFinding.reasoning}</p>
                </div>

                {/* Extracted Entities */}
                <div>
                  <h4 className="font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3">
                    Extracted Entities & Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    {Object.entries(selectedFinding.entities || {}).map(([key, val]) => {
                      if (!val || (Array.isArray(val) && val.length === 0)) return null;
                      return (
                        <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <span className="text-cyan-400 font-bold capitalize block">{key.replace('_', ' ')}:</span>
                          <span className="text-slate-300 block mt-1">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suspicious Indicators */}
                {selectedFinding.indicators && selectedFinding.indicators.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs uppercase text-slate-400 tracking-wider mb-3">
                      Suspicious Risk Indicators
                    </h4>
                    <div className="space-y-2">
                      {selectedFinding.indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono flex items-start gap-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-orange-400">{ind.type}:</span>{' '}
                            <span className="text-slate-200">{ind.value}</span>
                            <p className="text-slate-500 text-[11px] mt-0.5">{ind.context}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD EVIDENCE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" /> Evidence Intake
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                  Upload Image or Text File
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,text/plain,text/csv,application/json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Supported: JPG, PNG, WEBP, TXT, CSV, JSON (Max 10MB)</p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-600">OR</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider mb-2">
                  Paste Chat Logs / Raw Evidence Text
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste chat history, header logs, or raw terminal output..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Storing Evidence...' : 'Store & Calculate SHA-256'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
