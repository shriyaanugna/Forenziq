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

  // Active Tab: EVIDENCE | FINDINGS | CORRELATIONS | GRAPH | AUDIT | REPORTS
  const [activeTab, setActiveTab] = useState<
    'EVIDENCE' | 'FINDINGS' | 'CORRELATIONS' | 'GRAPH' | 'AUDIT' | 'REPORTS'
  >('EVIDENCE');

  // Upload modal/drawer state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis & correlation trigger states
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
    return <div className="p-8 text-slate-500 dark:text-slate-400 font-mono animate-pulse">Initializing case workspace...</div>;
  }

  if (error || !caseItem) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-500/30 rounded-2xl text-rose-800 dark:text-red-300 shadow-sm">
        <h3 className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-red-400" /> Workspace Error
        </h3>
        <p className="mt-2 text-sm text-rose-700 dark:text-red-400/80">{error || 'Case not found'}</p>
        <Link to="/cases" className="inline-block mt-4 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline">
          &larr; Return to Cases List
        </Link>
      </div>
    );
  }

  // Summary counts
  const criticalCount = findingsList.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findingsList.filter((f) => f.severity === 'HIGH').length;
  const latestAudit = auditLogs.length > 0 ? auditLogs[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-cyan-400 bg-slate-100 dark:bg-cyan-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-cyan-800">
                {caseItem.case_id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {caseItem.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{caseItem.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{caseItem.description || 'No description provided.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" /> Add Evidence
            </button>

            <button
              onClick={handleRunCorrelationScan}
              disabled={correlating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-bold text-xs transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" /> {correlating ? 'Scanning...' : 'Correlate Evidence'}
            </button>

            <button
              onClick={handleGenerateReport}
              disabled={generatingReportState}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" /> {generatingReportState ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>
        </div>

        {/* Workspace Quick Severity & Audit Telemetry Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Total Evidence</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-200 mt-0.5 block">{evidenceList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Findings</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-200 mt-0.5 block">{findingsList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">High / Critical</span>
            <span className="text-base font-bold text-rose-600 dark:text-red-400 mt-0.5 block">{criticalCount + highCount}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Correlations</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{correlationsList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Audit Events</span>
            <span className="text-base font-bold text-slate-900 dark:text-cyan-400 mt-0.5 block">{auditLogs.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block text-[10px]">Latest Activity</span>
            <span className="text-[11px] text-slate-800 dark:text-slate-300 mt-0.5 block truncate">
              {latestAudit ? latestAudit.event_type : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('EVIDENCE')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'EVIDENCE'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-3.5 h-3.5" /> Evidence ({evidenceList.length})
        </button>

        <button
          onClick={() => setActiveTab('FINDINGS')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'FINDINGS'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> AI Findings ({findingsList.length})
        </button>

        <button
          onClick={() => setActiveTab('CORRELATIONS')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CORRELATIONS'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Correlations ({correlationsList.length})
        </button>

        <button
          onClick={() => setActiveTab('GRAPH')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'GRAPH'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" /> Investigation Graph
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Chain of Custody ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-5 py-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'REPORTS'
              ? 'border-slate-900 text-slate-900 dark:border-cyan-400 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Forensic Reports ({reportsList.length})
        </button>
      </div>

      {/* EVIDENCE TAB */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-3">
          {evidenceList.length === 0 ? (
            <div className="py-16 text-center bg-white/80 dark:bg-slate-900 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">No Evidence Uploaded</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                Upload image screenshots or text/chat logs to calculate SHA-256 and initiate AI analysis.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-cyan-500/10 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/30 text-xs font-bold transition-colors"
              >
                Upload Evidence Now
              </button>
            </div>
          ) : (
            evidenceList.map((ev) => {
              const isAnalyzing = analyzingIds[ev.id];
              return (
                <div
                  key={ev.id}
                  className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-cyan-400">
                      {ev.type === 'IMAGE' ? <ImageIcon className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-cyan-400">{ev.evidence_id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {ev.mime_type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {(ev.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{ev.file_name}</h4>

                      <div className="flex items-center gap-1 mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 max-w-fit">
                        <Hash className="w-3 h-3 text-slate-900 dark:text-cyan-400 shrink-0" />
                        <span className="text-slate-500">SHA-256:</span>
                        <span className="truncate max-w-[280px] md:max-w-md">{ev.sha256_hash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      {ev.analysis_status === 'COMPLETED' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Analyzed
                        </span>
                      ) : ev.analysis_status === 'FAILED' ? (
                        <span className="text-rose-600 dark:text-red-400 flex items-center gap-1 font-semibold">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      ) : ev.analysis_status === 'ANALYZING' || isAnalyzing ? (
                        <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1 animate-pulse font-semibold">
                          <Clock className="w-4 h-4" /> Processing...
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleTriggerAnalysis(ev.id)}
                      disabled={isAnalyzing || ev.analysis_status === 'ANALYZING'}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/30 text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
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
              <div className="p-8 text-center bg-white/80 dark:bg-slate-900 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-500 text-sm shadow-sm">
                No findings generated yet. Trigger AI analysis on an evidence item.
              </div>
            ) : (
              findingsList.map((fnd) => (
                <div
                  key={fnd.id}
                  onClick={() => setSelectedFinding(fnd)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${
                    selectedFinding?.id === fnd.id
                      ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-cyan-500 shadow-md'
                      : 'bg-white/80 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        fnd.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800'
                          : fnd.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-orange-950/80 dark:text-orange-400 dark:border-orange-800'
                          : fnd.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {fnd.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{fnd.finding_id}</span>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-2">{fnd.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{fnd.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            {!selectedFinding ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center text-slate-500 shadow-sm">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Select a finding from the list to view detailed extracted entities and reasoning.</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-cyan-400">{selectedFinding.finding_id}</span>
                    <span className="text-xs font-mono text-slate-500">
                      Confidence: {(selectedFinding.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{selectedFinding.title}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{selectedFinding.description}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                    Deterministic Engine Reasoning:
                  </span>
                  <p className="whitespace-pre-wrap font-mono leading-relaxed">{selectedFinding.reasoning}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs uppercase text-slate-500 tracking-wider mb-3">
                    Extracted Entities & Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    {Object.entries(selectedFinding.entities || {}).map(([key, val]) => {
                      if (!val || (Array.isArray(val) && val.length === 0)) return null;
                      return (
                        <div key={key} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-slate-900 dark:text-cyan-400 font-bold capitalize block">{key.replace('_', ' ')}:</span>
                          <span className="text-slate-700 dark:text-slate-300 block mt-1">
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
          <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Cross-Evidence Correlation Engine</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Detects shared emails, phone numbers, crypto addresses, and endpoints across distinct evidence items.
              </p>
            </div>
            <button
              onClick={handleRunCorrelationScan}
              disabled={correlating}
              className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${correlating ? 'animate-spin' : ''}`} /> Run Correlation Scan
            </button>
          </div>

          {correlationsList.length === 0 ? (
            <div className="py-16 text-center bg-white/80 dark:bg-slate-900 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-500 shadow-sm">
              No cross-evidence correlations detected yet. Upload multiple evidence files with shared entities to correlate.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correlationsList.map((crl) => (
                <div key={crl.id} className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{crl.correlation_id}</span>
                    <span className="text-xs font-mono text-slate-500">
                      Confidence: {(crl.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Matched Entity</span>
                    <span className="text-slate-900 dark:text-slate-100 font-mono font-bold text-sm block mt-0.5">
                      {crl.matched_entity_value} ({crl.matched_entity_type})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">{crl.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVESTIGATION GRAPH TAB */}
      {activeTab === 'GRAPH' && (
        <InvestigationGraph
          evidenceList={evidenceList}
          findingsList={findingsList}
          correlationsList={correlationsList}
        />
      )}

      {/* CHAIN OF CUSTODY AUDIT TAB */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <History className="w-4 h-4 text-slate-900 dark:text-cyan-400" /> Chronological Chain of Custody Audit Trail
            </h3>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} Immutable Events</span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No audit events recorded.</p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-cyan-400 shrink-0 mt-0.5">
                    {log.event_type}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200">{log.description}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">
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
          <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Court-Ready Forensic PDF Export</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Generates a complete forensic PDF report containing hashes, findings, correlations, and audit logs.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReportState}
              className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" /> Generate New Report
            </button>
          </div>

          {reportsList.length === 0 ? (
            <div className="py-16 text-center bg-white/80 dark:bg-slate-900 border border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-500 shadow-sm">
              No reports generated for this case yet. Click 'Generate New Report' to assemble forensic PDF.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {reportsList.map((rpt) => (
                <div
                  key={rpt.id}
                  className="bg-white/80 backdrop-blur-md dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{rpt.report_id}</span>
                    <h4 className="font-sans font-semibold text-slate-900 dark:text-slate-200 mt-1">{rpt.file_name}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Created: {new Date(rpt.created_at).toUTCString()}
                    </span>
                  </div>

                  <a
                    href={`/api/reports/${rpt.report_id}?download=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-slate-900 dark:text-cyan-400" /> Evidence Intake
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-red-950/60 border border-rose-200 dark:border-red-500/40 rounded-xl text-rose-800 dark:text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                  Upload Image or Text File
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,text/plain,text/csv,application/json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-900 dark:file:bg-slate-800 dark:file:text-cyan-400 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Supported: JPG, PNG, WEBP, TXT, CSV, JSON (Max 10MB)</p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600">OR</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                  Paste Chat Logs / Raw Evidence Text
                </label>
                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste chat history, header logs, or raw terminal output..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-cyan-500 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors disabled:opacity-50 shadow-sm"
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
