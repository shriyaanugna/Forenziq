import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Eye, EyeOff, AlertCircle, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSubmittingRef = useRef(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength checks
  const isMinLength = password.length >= 8;
  const hasSpecialOrNumber = /[0-9!@#$%^&*]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || isSubmittingRef.current) {
      return;
    }

    setError(null);
    setInfo(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isMinLength) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const res = await signup(trimmedEmail, password, trimmedName);

      if (res.error) {
        setError(res.error);
      } else if (res.info) {
        setInfo(res.info);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during account creation.');
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans transition-colors">
      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-white dark:bg-[#0B1426] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-sky-500 dark:text-sky-400" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            FOREN<span className="text-sky-500 dark:text-sky-400">ZIQ</span>
          </span>
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create your FORENZIQ account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start managing digital forensic investigations securely.</p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md astra-glass-card rounded-3xl p-8 relative z-10 dark:bg-[#0B1426]/90 dark:border-sky-900/50">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent Alex Vance"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@agency.gov"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-11 pr-11 py-2.5 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Guidance */}
          <div className="p-3 bg-white/60 dark:bg-[#070e1e]/80 rounded-2xl border border-slate-200/50 dark:border-sky-900/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className={isMinLength ? 'text-slate-900 dark:text-slate-200 font-semibold' : ''}>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasSpecialOrNumber ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className={hasSpecialOrNumber ? 'text-slate-900 dark:text-slate-200 font-semibold' : ''}>Contains numbers or special characters</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="astra-btn-primary w-full justify-center py-3 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Investigator Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-sky-900/30 pt-5">
          Already registered?{' '}
          <Link to="/login" className="text-sky-500 dark:text-sky-400 hover:underline font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
