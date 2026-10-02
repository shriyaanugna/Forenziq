import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Database,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  Activity,
  CheckCircle2,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import Forensic3DHero from '../components/Forensic3DHero';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const scrollToSection = useCallback((sectionId: string) => {
    const targetId = sectionId.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      setActiveSection(targetId);
    }
  }, []);

  // Handle initial hash, hash changes in URL, refresh, back/forward navigation
  useEffect(() => {
    const hash = location.hash || (typeof window !== 'undefined' ? window.location.hash : '');
    if (hash) {
      const sectionId = hash.replace('#', '');
      // Timeout ensures DOM is fully painted
      const timer = setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setActiveSection('hero');
    }
  }, [location.hash, location.pathname, scrollToSection]);

  // Set up IntersectionObserver to update active section on scroll if available
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const sections = ['hero', 'how-it-works', 'capabilities', 'preview'];
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
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

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Update URL hash without full reloads
    if (typeof window !== 'undefined' && window.location.hash !== `#${targetId}`) {
      window.history.pushState(null, '', `#${targetId}`);
    }

    scrollToSection(targetId);
  };

  return (
    <div className="min-h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden relative transition-colors">

      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto px-6 py-3.5 bg-white/75 dark:bg-[#0B1426]/80 backdrop-blur-2xl border border-white/80 dark:border-sky-900/40 rounded-full shadow-xl shadow-sky-950/20 flex items-center justify-between">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className={`transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                activeSection === 'hero' ? 'text-sky-500 dark:text-sky-400 font-bold border-b-2 border-sky-500 pb-0.5' : ''
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className={`transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                activeSection === 'how-it-works' ? 'text-sky-500 dark:text-sky-400 font-bold border-b-2 border-sky-500 pb-0.5' : ''
              }`}
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={(e) => handleNavClick(e, 'capabilities')}
              className={`transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                activeSection === 'capabilities' ? 'text-sky-500 dark:text-sky-400 font-bold border-b-2 border-sky-500 pb-0.5' : ''
              }`}
            >
              Capabilities
            </a>
            <a
              href="#preview"
              onClick={(e) => handleNavClick(e, 'preview')}
              className={`transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                activeSection === 'preview' ? 'text-sky-500 dark:text-sky-400 font-bold border-b-2 border-sky-500 pb-0.5' : ''
              }`}
            >
              Workspace Preview
            </a>
          </nav>

          {/* Action Authentication Buttons & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="astra-btn-primary text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard ({user.name || user.email.split('@')[0]})</span>
                  <span className="sm:hidden">Dashboard</span>
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

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-[#070e1e] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-900/50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto px-6 py-4 bg-white/95 dark:bg-[#0B1426]/95 backdrop-blur-2xl border border-slate-200 dark:border-sky-900/50 rounded-2xl shadow-xl flex flex-col space-y-4 text-sm font-semibold text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className={`p-2 rounded-lg transition-colors ${
                activeSection === 'hero' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className={`p-2 rounded-lg transition-colors ${
                activeSection === 'how-it-works' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={(e) => handleNavClick(e, 'capabilities')}
              className={`p-2 rounded-lg transition-colors ${
                activeSection === 'capabilities' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Capabilities
            </a>
            <a
              href="#preview"
              onClick={(e) => handleNavClick(e, 'preview')}
              className={`p-2 rounded-lg transition-colors ${
                activeSection === 'preview' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Workspace Preview
            </a>
          </div>
        )}
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

              <a
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, 'how-it-works')}
                className="astra-btn-secondary text-sm px-6 py-3.5 text-center"
              >
                <span>Discover How It Works</span>
              </a>
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
      <section id="capabilities" className="scroll-mt-28 relative z-10 py-20 px-6 border-t border-slate-200/50 dark:border-sky-900/30">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400 uppercase tracking-widest">PLATFORM CAPABILITIES</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">End-to-End Digital Forensic Investigation Pipeline</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Engineered for forensic accuracy, rapid correlation, and immutable legal custody.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Capability 1 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border dark:border-sky-800/50 flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Image & Vision Forensics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated OCR text extraction combined with multi-LLM vision models for screenshot, document, and image evidence analysis.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border dark:border-blue-800/50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chat & Text Intelligence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Deep entity extraction for chat logs and transcripts to surface crypto wallets, IP addresses, usernames, and financial indicators.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 border dark:border-cyan-800/50 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-AI Orchestration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Server-side fallback sequence (Groq → Cerebras → Gemini → OpenRouter) ensuring maximum resilience and zero secret key exposure.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border dark:border-rose-800/50 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deterministic Severity Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Objective scoring rules evaluate findings to assign reproducible risk classifications (LOW, MEDIUM, HIGH, CRITICAL).
              </p>
            </div>

            {/* Capability 5 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border dark:border-indigo-800/50 flex items-center justify-center">
                <GitMerge className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pairwise Cross-Correlation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Matches normalized entities across disjointed evidence items with deterministic confidence scoring to reveal hidden link vectors.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="astra-glass-card p-6 space-y-4 dark:bg-[#0B1426]/85 dark:border-sky-900/40">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border dark:border-amber-800/50 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Immutable Chain of Custody</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cryptographic SHA-256 evidence hashing and tamper-proof audit trail logs guarantee evidentiary integrity for legal proceedings.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: WORKSPACE PREVIEW */}
      <section id="preview" className="scroll-mt-28 relative z-10 py-20 px-6 border-t border-slate-200/50 dark:border-sky-900/30">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold font-mono text-sky-500 dark:text-sky-400 uppercase tracking-widest">WORKSPACE PREVIEW</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">Interactive Forensic Investigation Workspace</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Streamlined dashboard for multi-source ingestion, real-time threat analysis, and court-ready reporting.</p>
          </div>

          {/* Interactive Workspace Preview Container */}
          <div className="astra-glass-card p-6 sm:p-8 dark:bg-[#0B1426]/90 dark:border-sky-900/50 space-y-6">

            {/* Preview Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-sky-900/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-sky-500 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800">
                    CASE-8F32A190
                  </span>
                  <span className="astra-pill-badge bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[11px]">
                    ● LIVE INVESTIGATION
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
                  Operation Shadow Trace – Financial Exfiltration
                </h3>
              </div>

              <Link to={user ? "/dashboard" : "/login"} className="astra-btn-primary text-xs self-start sm:self-auto">
                <span>Explore Live Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Preview Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-mono">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>TOTAL EVIDENCE</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">14 Items</div>
                <div className="text-[10px] text-slate-400 font-mono">8 Images • 6 Chat Logs</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-rose-500 text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>THREAT FINDINGS</span>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">29 Findings</div>
                <div className="text-[10px] text-rose-500 font-mono font-semibold">6 Critical Severities</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-indigo-500 text-xs font-mono">
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>CORRELATIONS</span>
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12 Cross-Matches</div>
                <div className="text-[10px] text-indigo-400 font-mono">92% Match Avg.</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-500 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CHAIN OF CUSTODY</span>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Valid</div>
                <div className="text-[10px] text-emerald-500 font-mono">SHA-256 Verified</div>
              </div>
            </div>

            {/* Active Finding Visual Row */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>CRITICAL FINDING MATCH #FND-92A7B10C</span>
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Identical Crypto Wallet Address (<code className="bg-rose-100 dark:bg-rose-900/50 px-1.5 py-0.5 rounded font-mono text-xs">0x71C...38f9</code>) identified across chat logs and screenshot evidence.
                </div>
              </div>
              <span className="astra-pill-badge bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 font-mono text-xs self-start md:self-auto">
                HIGH CONFIDENCE (98%)
              </span>
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
