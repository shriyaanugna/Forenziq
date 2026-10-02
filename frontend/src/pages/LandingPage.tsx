import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ArrowRight,
  Cpu,
  FileCheck2,
  Lock,
  GitMerge,
  Image as ImageIcon,
  MessageSquare,
  Layers,
  ChevronRight,
  Database,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import Forensic3DHero from '../components/Forensic3DHero';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden relative transition-colors">

      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto px-6 py-3.5 bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-full shadow-xl shadow-indigo-900/5 flex items-center justify-between">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                FORENZIQ
              </span>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                AUTOMATED DIGITAL FORENSICS
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#hero" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-blue-600 transition-colors">Capabilities</a>
            <a href="#preview" className="hover:text-blue-600 transition-colors">Workspace Preview</a>
          </nav>

          {/* Action Authentication Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="astra-btn-primary text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Dashboard ({user.name || user.email.split('@')[0]})</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="astra-btn-secondary text-xs">
                  Sign In
                </Link>
                <Link to="/register" className="astra-btn-primary text-xs">
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative z-10 pt-10 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-6 space-y-6">
            <div className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>AI-POWERED DIGITAL FORENSICS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Every digital trace <br />
              tells a <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">story.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              FORENZIQ transforms complex digital evidence into structured, AI-assisted forensic investigations and detailed court-ready PDF reports.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to={user ? "/dashboard" : "/register"} className="astra-btn-primary text-sm px-6 py-3.5">
                <span>{user ? "Go to Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button onClick={scrollToHowItWorks} className="astra-btn-secondary text-sm px-6 py-3.5">
                <span>Discover How It Works</span>
              </button>
            </div>

            <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/60 grid grid-cols-3 gap-4 font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="space-y-1">
                <div className="text-slate-900 dark:text-white font-bold text-sm">Multi-AI Engine</div>
                <div className="text-slate-400 text-[11px]">Groq • Cerebras • Gemini</div>
              </div>
              <div className="space-y-1 border-l border-slate-200/50 dark:border-slate-800/60 pl-4">
                <div className="text-slate-900 dark:text-white font-bold text-sm">SHA-256 Chain</div>
                <div className="text-slate-400 text-[11px]">Immutable Custody</div>
              </div>
              <div className="space-y-1 border-l border-slate-200/50 dark:border-slate-800/60 pl-4">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">PDF Reports</div>
                <div className="text-slate-400 text-[11px]">Server PDFKit Engine</div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6 relative">
            <div className="w-full h-[460px]">
              <Forensic3DHero />
            </div>

            <div className="absolute -bottom-6 -left-4 sm:-left-6 right-4 sm:right-6 astra-glass-card p-5 space-y-3 pointer-events-none">
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>INVESTIGATION WORKSPACE • ACTIVE</span>
                </div>
                <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">LATEST FINDING</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">Crypto Wallet Cross-Match</div>
                  <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-1">Severity: CRITICAL</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700/60">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">EVIDENCE INGESTION</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">CHAT-4B2E8A1F • TXT</div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">SHA-256 Confirmed</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 1: HOW FORENZIQ WORKS */}
      <section id="how-it-works" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest">WORKFLOW PIPELINE</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Three Steps from Evidence to Court-Ready Report</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic hashing, automated OCR/vision scanning, and cross-evidence correlation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="astra-glass-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-blue-100 text-blue-800 font-mono text-xs">STEP 01</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Collect Evidence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload image evidence or chat transcripts. FORENZIQ automatically computes cryptographic SHA-256 hashes and assigns globally unique evidence IDs.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <GitMerge className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-indigo-100 text-indigo-800 font-mono text-xs">STEP 02</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Analyze & Investigate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-provider AI fallbacks and OCR run entity extraction and suspicious content analysis. Deterministic severity scoring evaluates findings.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-emerald-100 text-emerald-800 font-mono text-xs">STEP 03</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Generate Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compile findings, cross-evidence correlations, and immutable chain-of-custody audit logs into structured PDF reports stored in Supabase Storage.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-6 text-center text-xs font-medium text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>FORENZIQ © 2025 • Automated Digital Forensics Platform</div>
          <div className="flex items-center space-x-4">
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>PDFKit Engine</span>
            <span>•</span>
            <span>Multi-LLM Orchestration</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
