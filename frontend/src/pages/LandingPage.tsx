import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  Search,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import Forensic3DHero from '../components/Forensic3DHero';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Handle smooth scrolling and browser URL hash update
  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const elementId = id.replace('#', '');
    window.history.pushState(null, '', `#${elementId}`);
    setActiveSection(elementId);

    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to hash on page load / route change
  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (hash) {
      const elementId = hash.replace('#', '');
      setActiveSection(elementId);
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Track scroll position to update active navbar link state
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = ['hero', 'how-it-works', 'capabilities', 'preview'];
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.1,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden relative transition-colors">

      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto px-6 py-3.5 bg-white/75 dark:bg-[#0B1426]/80 backdrop-blur-2xl border border-white/80 dark:border-sky-900/40 rounded-full shadow-xl shadow-sky-950/20 flex items-center justify-between">

          {/* Logo & Brand */}
          <Link to="/" onClick={(e) => scrollToSection('hero', e)} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 dark:from-white dark:to-sky-300 bg-clip-text text-transparent">
                FORENZIQ
              </span>
              <p className="text-[10px] text-sky-500 dark:text-sky-400 font-semibold tracking-wider uppercase">
                AUTOMATED DIGITAL FORENSICS
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#hero"
              onClick={(e) => scrollToSection('hero', e)}
              className={`transition-colors ${activeSection === 'hero' ? 'text-sky-500 font-bold dark:text-sky-400' : 'hover:text-sky-500 dark:hover:text-sky-400'}`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection('how-it-works', e)}
              className={`transition-colors ${activeSection === 'how-it-works' ? 'text-sky-500 font-bold dark:text-sky-400' : 'hover:text-sky-500 dark:hover:text-sky-400'}`}
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={(e) => scrollToSection('capabilities', e)}
              className={`transition-colors ${activeSection === 'capabilities' ? 'text-sky-500 font-bold dark:text-sky-400' : 'hover:text-sky-500 dark:hover:text-sky-400'}`}
            >
              Capabilities
            </a>
            <a
              href="#preview"
              onClick={(e) => scrollToSection('preview', e)}
              className={`transition-colors ${activeSection === 'preview' ? 'text-sky-500 font-bold dark:text-sky-400' : 'hover:text-sky-500 dark:hover:text-sky-400'}`}
            >
              Workspace Preview
            </a>
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
                  className="p-2.5 rounded-full bg-white/80 dark:bg-[#070e1e] border border-slate-200/80 dark:border-sky-900/50 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
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
      <section id="hero" className="scroll-mt-28 relative z-10 pt-10 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-6 space-y-6">
            <div className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>AI-POWERED DIGITAL FORENSICS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Every digital trace <br />
              tells a <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">story.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              FORENZIQ transforms complex digital evidence into structured, AI-assisted forensic investigations and detailed court-ready PDF reports.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to={user ? "/dashboard" : "/register"} className="astra-btn-primary text-sm px-6 py-3.5">
                <span>{user ? "Go to Dashboard" : "Get Started Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button onClick={(e) => scrollToSection('how-it-works', e)} className="astra-btn-secondary text-sm px-6 py-3.5">
                <span>Discover How It Works</span>
              </button>
            </div>

            <div className="pt-8 border-t border-slate-200/50 dark:border-sky-900/30 grid grid-cols-3 gap-4 font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="space-y-1">
                <div className="text-slate-900 dark:text-white font-bold text-sm">Multi-AI Engine</div>
                <div className="text-slate-400 text-[11px]">Groq • Cerebras • Gemini</div>
              </div>
              <div className="space-y-1 border-l border-slate-200/50 dark:border-sky-900/30 pl-4">
                <div className="text-slate-900 dark:text-white font-bold text-sm">SHA-256 Chain</div>
                <div className="text-slate-400 text-[11px]">Immutable Custody</div>
              </div>
              <div className="space-y-1 border-l border-slate-200/50 dark:border-sky-900/30 pl-4">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">PDF Reports</div>
                <div className="text-slate-400 text-[11px]">Server PDFKit Engine</div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6 relative">
            <div className="w-full h-[460px]">
              <Forensic3DHero />
            </div>

            <div className="absolute -bottom-6 -left-4 sm:-left-6 right-4 sm:right-6 astra-glass-card p-5 space-y-3 pointer-events-none dark:bg-[#0B1426]/90 dark:border-sky-900/40">
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-sky-900/30 pb-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-sky-500 dark:text-sky-400 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>INVESTIGATION WORKSPACE • ACTIVE</span>
                </div>
                <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50">VERIFIED</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">LATEST FINDING</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">Crypto Wallet Cross-Match</div>
                  <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-1">Severity: CRITICAL</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-white/80 dark:border-sky-900/40">
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
      <section id="how-it-works" className="scroll-mt-28 relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400 uppercase tracking-widest">WORKFLOW PIPELINE</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Three Steps from Evidence to Court-Ready Report</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic hashing, automated OCR/vision scanning, and cross-evidence correlation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-blue-100 text-blue-800 dark:bg-sky-950/80 dark:text-sky-300 dark:border dark:border-sky-800/50 font-mono text-xs">STEP 01</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Collect Evidence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload image evidence or chat transcripts. FORENZIQ automatically computes cryptographic SHA-256 hashes and assigns globally unique evidence IDs.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border dark:border-indigo-800/50 flex items-center justify-center">
                <GitMerge className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border dark:border-indigo-800/50 font-mono text-xs">STEP 02</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Analyze & Investigate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-provider AI fallbacks and OCR run entity extraction and suspicious content analysis. Deterministic severity scoring evaluates findings.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border dark:border-emerald-800/50 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50 font-mono text-xs">STEP 03</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Generate Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compile findings, cross-evidence correlations, and immutable chain-of-custody audit logs into structured PDF reports stored in Supabase Storage.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: CAPABILITIES */}
      <section id="capabilities" className="scroll-mt-28 relative z-10 py-20 px-6 bg-slate-900/5 dark:bg-[#070e1e]/40">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400 uppercase tracking-widest">FORENSIC CAPABILITIES</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Comprehensive Digital Investigation Tools</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Built for investigators, law enforcement, and cybersecurity analysts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cryptographic SHA-256 Hashing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every piece of uploaded evidence is hashed immediately upon ingestion to guarantee data integrity and establish chain of custody.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Provider AI Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated fallback sequence spanning Groq, Cerebras, Gemini, and OpenRouter for high-speed entity extraction and deep analysis.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">OCR & Vision Inspection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Optical Character Recognition scans images, documents, and screenshots to detect embedded text, credentials, URLs, and artifacts.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Severity Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Reproducible rule-based severity scoring (CRITICAL, HIGH, MEDIUM, LOW) evaluates financial threats, malware indicators, and credentials.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cross-Evidence Correlation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automatically links phone numbers, crypto addresses, email addresses, and usernames across separate evidence files in a case.
              </p>
            </div>

            <div className="astra-glass-card p-6 space-y-3 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Court-Ready PDF Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates formal PDF reports complete with dynamic tables of contents, evidence hashes, finding matrices, and audit logs.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: WORKSPACE PREVIEW */}
      <section id="preview" className="scroll-mt-28 relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400 uppercase tracking-widest">LIVE INTERFACE</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Investigation Workspace Preview</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Streamlined dashboard for managing cases, analyzing evidence, and managing findings.</p>
          </div>

          <div className="astra-glass-card p-6 md:p-8 space-y-6 dark:bg-[#0B1426]/90 dark:border-sky-900/40 shadow-2xl">

            {/* Header Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-sky-900/40 pb-4 gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-sky-500 dark:text-sky-400 font-bold">
                  <span>CASE-9F3A1D7C</span>
                  <span>•</span>
                  <span className="text-emerald-500">ACTIVE INVESTIGATION</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Operation Shadow Trace • Financial Fraud Inquiry
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-mono font-bold border border-rose-500/20">
                  CRITICAL SEVERITY
                </span>
                <Link to={user ? "/dashboard" : "/login"} className="astra-btn-primary text-xs px-4 py-2">
                  <span>Open Full Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Content Mockup Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">

              {/* Evidence Panel */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/60 border border-slate-200/60 dark:border-sky-900/40">
                <div className="flex items-center justify-between font-mono font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-sky-500" />
                    <span>INGESTED EVIDENCE (3)</span>
                  </div>
                  <span className="text-[10px] text-sky-500">HASH VERIFIED</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-sky-900/40 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                      <span>IMG-9F3A1D7C.PNG</span>
                      <span className="text-[10px] font-mono text-emerald-500">PROCESSED</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-sky-900/40 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                      <span>CHAT-4B2E8A1F.TXT</span>
                      <span className="text-[10px] font-mono text-emerald-500">PROCESSED</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      SHA256: 8f4e2b11a9c3308d712019a7719f902a771b99f3014a908126b801a21e058c42
                    </p>
                  </div>
                </div>
              </div>

              {/* Findings Panel */}
              <div className="lg:col-span-2 space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/60 border border-slate-200/60 dark:border-sky-900/40">
                <div className="flex items-center justify-between font-mono font-bold text-slate-700 dark:text-slate-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>KEY FINDINGS & EXTRACTED ENTITIES</span>
                  </div>
                  <span className="text-[10px] text-rose-500">2 HIGH/CRITICAL</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-sky-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Unregistered Crypto Transfer Request</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono text-[10px] font-bold">
                        CRITICAL • 98% Confidence
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      Detected active wire request to unverified offshore wallet <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sky-400">0x71C...3F9</code> matching entity extracted from chat transcript CHAT-4B2E8A1F.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-sky-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">Credential Exposure Indicator</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold">
                        HIGH • 92% Confidence
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      OCR scan revealed plain-text administrative access key in screenshot IMG-9F3A1D7C.PNG.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-sky-900/30">
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
