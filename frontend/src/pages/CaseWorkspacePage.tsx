import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchCase,
  fetchCaseEvidence,
  fetchCaseFindings,
  fetchCaseCorrelations,
  fetchCaseAuditTrail,
  fetchCaseReports,
  uploadEvidence,
  analyzeEvidence,
  triggerCorrelationScan,
  generateReport,
} from '../services/api';
import { Case, Evidence, Finding, Correlation, AuditLog, Report } from '../types';
import InvestigationGraph from '../components/InvestigationGraph';
import {
  FolderLock,
  UploadCloud,
  FileText,
  ShieldAlert,
  Hash,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Share2,
  History,
  Download,
  Network,
  RefreshCw,
} from 'lucide-react';

export default function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();

  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [correlationsList, setCorrelationsList] = useState<Correlation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reportsList, setReportsList] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'EVIDENCE' | 'FINDINGS' | 'CORRELATIONS' | 'GRAPH' | 'AUDIT' | 'REPORTS'
  >('EVIDENCE');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const [correlating, setCorrelating] = useState(false);
  const [generatingReportState, setGeneratingReportState] = useState(false);

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const loadData = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const [c, ev, fnd, crl, aud, rpt] = await Promise.all([
        fetchCase(caseId),
        fetchCaseEvidence(caseId),
        fetchCaseFindings(caseId),
        fetchCaseCorrelations(caseId),
        fetchCaseAuditTrail(caseId),
        fetchCaseReports(caseId),
      ]);
      setCaseItem(c);
      setEvidenceList(ev);
      setFindingsList(fnd);
      setCorrelationsList(crl);
      setAuditLogs(aud);
      setReportsList(rpt);
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

  const handleRunCorrelationScan = async () => {
    setCorrelating(true);
    try {
      await triggerCorrelationScan(caseId!);
      await loadData();
    } catch (err: any) {
      alert(`Correlation scan failed: ${err.message}`);
    } finally {
      setCorrelating(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReportState(true);
    try {
      await generateReport(caseId!);
      await loadData();
      setActiveTab('REPORTS');
    } catch (err: any) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setGeneratingReportState(false);
    }
  };

  if (loading) {
    return <div className="astra-glass-card p-12 text-center text-slate-400 font-semibold text-sm animate-pulse">Initializing case workspace...</div>;
  }

  if (error || !caseItem) {
    return (
      <div className="astra-glass-card p-6 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
        <h3 className="font-bold flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /> Workspace Error
        </h3>
        <p className="mt-2 text-xs text-rose-700 dark:text-rose-400/80">{error || 'Case not found'}</p>
        <Link to="/cases" className="astra-btn-primary text-xs inline-flex mt-4">
          &larr; Return to Cases List
        </Link>
      </div>
    );
  }

  const criticalCount = findingsList.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findingsList.filter((f) => f.severity === 'HIGH').length;
  const latestAudit = auditLogs.length > 0 ? auditLogs[0] : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Glass Header */}
      <div className="astra-glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-mono text-xs">
                {caseItem.case_id}
              </span>
              <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                {caseItem.status}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{caseItem.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{caseItem.description || 'No description provided.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowUploadModal(true)} className="astra-btn-primary text-xs">
              <UploadCloud className="w-4 h-4" /> Add Evidence
            </button>

            <button onClick={handleRunCorrelationScan} disabled={correlating} className="astra-btn-secondary text-xs">
              <Share2 className="w-4 h-4 text-amber-600" /> {correlating ? 'Scanning...' : 'Correlate Evidence'}
            </button>

            <button onClick={handleGenerateReport} disabled={generatingReportState} className="astra-btn-secondary text-xs">
              <FileText className="w-4 h-4 text-emerald-600" /> {generatingReportState ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Evidence Files</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5 block">{evidenceList.length}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Findings Total</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5 block">{findingsList.length}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">High / Critical</span>
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">{criticalCount + highCount}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Correlations</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">{correlationsList.length}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Audit Trail</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">{auditLogs.length}</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Latest Activity</span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono mt-0.5 block truncate">
              {latestAudit ? latestAudit.event_type : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-full border border-white/60 dark:border-slate-800">
        {[
          { key: 'EVIDENCE', label: `Evidence (${evidenceList.length})`, icon: FolderLock },
          { key: 'FINDINGS', label: `AI Findings (${findingsList.length})`, icon: ShieldAlert },
          { key: 'CORRELATIONS', label: `Correlations (${correlationsList.length})`, icon: Share2 },
          { key: 'GRAPH', label: 'Investigation Graph', icon: Network },
          { key: 'AUDIT', label: `Chain of Custody (${auditLogs.length})`, icon: History },
          { key: 'REPORTS', label: `Forensic Reports (${reportsList.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* EVIDENCE TAB */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-3">
          {evidenceList.length === 0 ? (
            <div className="astra-glass-card p-12 text-center">
              <UploadCloud className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Evidence Uploaded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload images or chat logs to calculate SHA-256 and run real AI analysis.
              </p>
              <button onClick={() => setShowUploadModal(true)} className="astra-btn-primary text-xs inline-flex mt-4">
                Upload Evidence Now
              </button>
            </div>
          ) : (
            evidenceList.map((ev) => {
              const isAnalyzing = analyzingIds[ev.id];
              return (
                <div key={ev.id} className="astra-glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {ev.type === 'IMAGE' ? <ImageIcon className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-mono text-[11px]">
                          {ev.evidence_id}
                        </span>
                        <span className="astra-pill-badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono text-[10px]">
                          {ev.mime_type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {(ev.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-2">{ev.file_name}</h4>

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-500 bg-white/60 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-white/80 dark:border-slate-700/60 max-w-fit">
                        <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-semibold text-slate-400">SHA-256:</span>
                        <span className="truncate max-w-[280px] md:max-w-md text-slate-700 dark:text-slate-200">{ev.sha256_hash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {ev.analysis_status === 'COMPLETED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Analyzed
                        </span>
                      ) : ev.analysis_status === 'FAILED' ? (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      ) : ev.analysis_status === 'ANALYZING' || isAnalyzing ? (
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse">
                          <Clock className="w-4 h-4" /> Processing...
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleTriggerAnalysis(ev.id)}
                      disabled={isAnalyzing || ev.analysis_status === 'ANALYZING'}
                      className="astra-btn-primary text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {ev.analysis_status === 'COMPLETED' ? 'Re-Analyze' : 'Run AI Analysis'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FINDINGS TAB */}
      {activeTab === 'FINDINGS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            {findingsList.length === 0 ? (
              <div className="astra-glass-card p-8 text-center text-slate-400 text-xs">
                No findings generated yet. Trigger AI analysis on an evidence item.
              </div>
            ) : (
              findingsList.map((fnd) => (
                <div
                  key={fnd.id}
                  onClick={() => setSelectedFinding(fnd)}
                  className={`astra-glass-card p-4 cursor-pointer transition-all ${
                    selectedFinding?.id === fnd.id
                      ? 'ring-2 ring-blue-600 shadow-md'
                      : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`astra-pill-badge ${
                        fnd.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : fnd.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : fnd.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {fnd.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{fnd.finding_id}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-2">{fnd.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{fnd.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {!selectedFinding ? (
              <div className="astra-glass-card h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Select a finding from the list to view detailed extracted entities and reasoning.</p>
              </div>
            ) : (
              <div className="astra-glass-card p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-mono text-xs">
                      {selectedFinding.finding_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Confidence: {(selectedFinding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">{selectedFinding.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{selectedFinding.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                    Deterministic Engine Reasoning:
                  </span>
                  <p className="whitespace-pre-wrap font-mono leading-relaxed">{selectedFinding.reasoning}</p>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3">
                    Extracted Entities & Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    {Object.entries(selectedFinding.entities || {}).map(([key, val]) => {
                      if (!val || (Array.isArray(val) && val.length === 0)) return null;
                      return (
                        <div key={key} className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60">
                          <span className="text-blue-600 dark:text-blue-400 font-bold capitalize block">{key.replace('_', ' ')}:</span>
                          <span className="text-slate-700 dark:text-slate-200 block mt-1">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CORRELATIONS TAB */}
      {activeTab === 'CORRELATIONS' && (
        <div className="space-y-4">
          <div className="astra-glass-card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cross-Evidence Correlation Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detects shared emails, phone numbers, crypto addresses, and endpoints across distinct evidence items.
              </p>
            </div>
            <button onClick={handleRunCorrelationScan} disabled={correlating} className="astra-btn-secondary text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${correlating ? 'animate-spin' : ''}`} /> Run Correlation Scan
            </button>
          </div>

          {correlationsList.length === 0 ? (
            <div className="astra-glass-card p-12 text-center text-slate-400 text-xs">
              No cross-evidence correlations detected yet. Upload multiple evidence files with shared entities to correlate.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correlationsList.map((crl) => (
                <div key={crl.id} className="astra-glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="astra-pill-badge bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-mono text-xs">
                      {crl.correlation_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Confidence: {(crl.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Matched Entity</span>
                    <span className="text-slate-800 dark:text-slate-100 font-mono font-bold text-xs block mt-0.5">
                      {crl.matched_entity_value} ({crl.matched_entity_type})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">{crl.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GRAPH TAB */}
      {activeTab === 'GRAPH' && (
        <InvestigationGraph
          evidenceList={evidenceList}
          findingsList={findingsList}
          correlationsList={correlationsList}
        />
      )}

      {/* AUDIT TAB */}
      {activeTab === 'AUDIT' && (
        <div className="astra-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Chronological Chain of Custody Audit Trail
            </h3>
            <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-mono text-xs">
              {auditLogs.length} Immutable Events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No audit events recorded.</p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60 flex items-start gap-3">
                  <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 text-[10px] shrink-0 mt-0.5">
                    {log.event_type}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200">{log.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Event ID: {log.event_id} • Timestamp: {new Date(log.created_at).toUTCString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="astra-glass-card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Court-Ready Forensic PDF Export</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generates a complete forensic PDF report containing hashes, findings, correlations, and audit logs.
              </p>
            </div>
            <button onClick={handleGenerateReport} disabled={generatingReportState} className="astra-btn-primary text-xs">
              <FileText className="w-4 h-4" /> Generate New Report
            </button>
          </div>

          {reportsList.length === 0 ? (
            <div className="astra-glass-card p-12 text-center text-slate-400 text-xs">
              No reports generated for this case yet. Click 'Generate New Report' to assemble forensic PDF.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {reportsList.map((rpt) => (
                <div key={rpt.id} className="astra-glass-card p-4 flex items-center justify-between">
                  <div>
                    <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs">
                      {rpt.report_id}
                    </span>
                    <h4 className="font-sans font-bold text-slate-800 dark:text-slate-100 mt-1">{rpt.file_name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Created: {new Date(rpt.created_at).toUTCString()}
                    </span>
                  </div>

                  <a
                    href={`/api/reports/${rpt.report_id}?download=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="astra-btn-primary text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD EVIDENCE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="astra-glass-card max-w-lg w-full p-6 space-y-5 bg-white/95 dark:bg-slate-900/95 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Evidence Intake
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 tracking-wider mb-2">
                  Upload Image or Text File
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,text/plain,text/csv,application/json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/60 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">Supported: JPG, PNG, WEBP, TXT, CSV, JSON (Max 10MB)</p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200/50 dark:border-slate-800/60"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400">OR</span>
                <div className="flex-grow border-t border-slate-200/50 dark:border-slate-800/60"></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 tracking-wider mb-2">
                  Paste Chat Logs / Raw Evidence Text
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste chat history, header logs, or raw terminal output..."
                  className="w-full p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex justify-end gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="astra-btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="astra-btn-primary text-xs">
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
