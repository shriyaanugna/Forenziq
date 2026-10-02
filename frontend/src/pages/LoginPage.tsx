import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans transition-colors">

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 dark:from-white dark:to-sky-300 bg-clip-text text-transparent">
            FORENZIQ
          </span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Investigator Sign In</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access your automated digital forensics command workspace.</p>
      </div>

      {/* Login Glass Card */}
      <div className="w-full max-w-md astra-glass-card p-8 relative z-10 dark:bg-[#0B1426]/90 dark:border-sky-900/50">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@agency.gov"
                required
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Password
              </label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Password reset requested.'); }} className="text-xs font-semibold text-sky-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-11 pr-11 py-3 rounded-full bg-white/80 dark:bg-[#070e1e]/80 border border-slate-200/80 dark:border-sky-900/50 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full astra-btn-primary py-3.5 text-sm font-bold">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-sky-900/30 pt-6">
          Don't have an investigator account?{' '}
          <Link to="/register" className="text-sky-500 dark:text-sky-400 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
