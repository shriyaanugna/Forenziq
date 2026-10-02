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
  User as UserIcon
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
    <div className="min-h-screen bg-[#06090e] text-slate-300 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">

      {/* Background Subtle Grid Effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-15 bg-repeat z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.25) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Ambient Lighting Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none z-0" />

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#080c14]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white font-mono">FORENZIQ</span>
              <p className="text-[10px] text-cyan-400 tracking-wider font-mono">AUTOMATED DIGITAL FORENSICS</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#hero" className="text-slate-200 hover:text-cyan-400 transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-cyan-400 transition-colors">Capabilities</a>
            <a href="#preview" className="hover:text-cyan-400 transition-colors">Workspace Preview</a>
          </nav>

          {/* Action Authentication Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-950/50"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Dashboard ({user.name || user.email.split('@')[0]})</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 border border-cyan-300/30 flex items-center space-x-1.5 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative z-10 pt-12 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6">

            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-POWERED DIGITAL FORENSICS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.15]">
              Every digital trace <br />
              tells a <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">story.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
              FORENZIQ transforms complex digital evidence into structured, AI-assisted forensic investigations and detailed reports. Analyze evidence, uncover suspicious patterns, and turn raw investigation data into actionable insights.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 border border-cyan-300/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!user && (
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Sign In to Account</span>
                </Link>
              )}

              <button
                onClick={scrollToHowItWorks}
                className="px-6 py-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-sm border border-slate-800/60 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Discover How It Works</span>
              </button>
            </div>

            {/* Product Metrics Grid */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 font-mono text-xs text-slate-400">
              <div className="space-y-1">
                <div className="text-white font-bold text-base">Multi-AI Engine</div>
                <div className="text-slate-500">Groq • Cerebras • Gemini</div>
              </div>
              <div className="space-y-1 border-l border-slate-800 pl-4">
                <div className="text-white font-bold text-base">SHA-256 Chain</div>
                <div className="text-slate-500">Immutable Custody</div>
              </div>
              <div className="space-y-1 border-l border-slate-800 pl-4">
                <div className="text-emerald-400 font-bold text-base">PDF Reports</div>
                <div className="text-slate-500">Server PDFKit Engine</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Forensic Canvas + Floating Dashboard Card */}
          <div className="lg:col-span-6 relative">

            {/* 3D Visual Centerpiece */}
            <div className="w-full h-[460px]">
              <Forensic3DHero />
            </div>

            {/* Floating Live Preview Glass Card Overlay */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 right-4 sm:right-6 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-2xl shadow-cyan-950/50 space-y-3 pointer-events-none">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <span>INVESTIGATION CASE WORKSPACE • ACTIVE</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500">LATEST FINDING</div>
                  <div className="font-semibold text-white mt-0.5">Crypto Wallet Cross-Match</div>
                  <div className="text-[10px] font-mono text-rose-400 mt-1">Severity: CRITICAL (96% Conf.)</div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500">EVIDENCE INGESTION</div>
                  <div className="font-semibold text-white mt-0.5">CHAT-4B2E8A1F • TXT</div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-1">SHA-256 Hash Confirmed</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SECTION 1: HOW FORENZIQ WORKS */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">WORKFLOW PIPELINE</h2>
            <p className="text-3xl font-serif text-white">Three steps from evidence to court-ready report</p>
            <p className="text-sm text-slate-400">Deterministic hashing, automated OCR/vision scanning, and cross-evidence correlation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400">STEP 01</span>
                <h3 className="text-lg font-bold text-white">1. Collect Evidence</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload image evidence (JPG, PNG, WEBP) or chat transcripts (TXT, CSV, JSON). FORENZIQ automatically computes cryptographic SHA-256 hashes and assigns globally unique evidence IDs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <GitMerge className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-indigo-400">STEP 02</span>
                <h3 className="text-lg font-bold text-white">2. Analyze & Investigate</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-provider AI fallbacks (Groq, Cerebras, Gemini, OpenRouter) and OCR run entity extraction and suspicious content analysis. Deterministic severity scoring evaluates findings.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-400">STEP 03</span>
                <h3 className="text-lg font-bold text-white">3. Generate Reports</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compile findings, cross-evidence correlations, and immutable chain-of-custody audit logs into structured PDF reports rendered server-side and stored securely in Supabase Storage.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SECTION 2: CORE CAPABILITIES */}
      <section id="capabilities" className="relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-12">

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">PLATFORM ARCHITECTURE</h2>
            <p className="text-3xl font-serif text-white mt-1">Core Forensic Capabilities</p>
          </div>
          <p className="text-xs text-slate-400 max-w-md mt-2 md:mt-0 font-mono">
            Built from scratch on Supabase PostgreSQL, Node.js REST API, and multi-LLM orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Image & Vision Forensics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OCR scanning and Gemini Vision analysis detect visible text, document headers, credentials, and suspicious visual context in image evidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Chat & Text Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured entity extraction identifies usernames, phone numbers, crypto wallet addresses, transaction IDs, URLs, and suspicious phrases across chat logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-AI Fallback Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resilient server-side provider order (Groq → Cerebras → Gemini → OpenRouter) ensures uninterrupted investigation analysis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Deterministic Severity Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reproducible scoring rules evaluate threat indicators, credential exposures, and financial risk into LOW, MEDIUM, HIGH, and CRITICAL severity classifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cross-Evidence Correlation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pairwise entity matching connects evidence items across the same investigation case to expose hidden relationships and intelligence graphs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Chain of Custody Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every action, evidence upload, AI analysis, and correlation is logged with SHA-256 hashes in an immutable audit trail.
            </p>
          </div>

        </div>

      </section>

      {/* 5. SECTION 3: WORKSPACE PREVIEW */}
      <section id="preview" className="relative z-10 py-20 px-6 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="text-center space-y-2">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CASE WORKSPACE</h2>
            <p className="text-3xl font-serif text-white">Complete Investigation Workspace</p>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Inspect evidence vaults, view findings summaries, explore 2D force-directed relationship graphs, and download PDF reports directly.
            </p>
          </div>

          {/* Interactive Workspace Preview Box */}
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/40 space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="font-bold text-cyan-400">CASE-2025-089</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px]">CRITICAL SEVERITY</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Operation DarkVault Extortion Investigation</h3>
              </div>

              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Open Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>EVIDENCE VAULT</span>
                  <span className="text-cyan-400">14 Items</span>
                </div>
                <div className="text-slate-200 font-sans">IMG-9F3A1D7C • Ransomware Screenshot</div>
                <div className="text-[10px] text-slate-500">SHA-256: e3b0c44298fc1c149afbf4c8996fb924...</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>FINDINGS DETECTED</span>
                  <span className="text-rose-400">8 Findings</span>
                </div>
                <div className="text-slate-200 font-sans">FND-9A2E • Darknet Crypto Wallet Exposure</div>
                <div className="text-[10px] text-emerald-400">Deterministic Score: 8.8 / 10.0</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>CROSS-CORRELATIONS</span>
                  <span className="text-amber-400">3 Matches</span>
                </div>
                <div className="text-slate-200 font-sans">CRL-8821 • Crypto Wallet & Telegram Handle</div>
                <div className="text-[10px] text-slate-400">Match Confidence: 96.4%</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="relative z-10 py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-serif text-white">
          Turn digital evidence into meaningful insights.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Start your investigation with FORENZIQ's AI-assisted forensic analysis platform. Secure evidence, generate deterministic findings, and export official reports.
        </p>

        <div className="pt-2">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-2xl shadow-cyan-500/30 border border-cyan-300/40 inline-flex items-center space-x-3 transition-all transform hover:-translate-y-1"
          >
            <span>{user ? "Launch FORENZIQ Dashboard" : "Get Started Now"}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>FORENZIQ © 2025 • Automated Digital Forensics Platform</div>
          <div className="flex items-center space-x-4 text-slate-400">
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
