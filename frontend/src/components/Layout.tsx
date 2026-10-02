import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  LayoutDashboard,
  FolderLock,
  PlusCircle,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Settings,
  ShieldCheck,
  Globe,
  LogOut,
  User as UserIcon,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases Workspace', icon: FolderLock },
    { to: '/cases/new', label: 'New Case', icon: PlusCircle },
    { to: '/images', label: 'Image Vault', icon: ImageIcon },
    { to: '/chats', label: 'Chat Vault', icon: MessageSquare },
    { to: '/reports', label: 'Reports & Logs', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-astra-mesh text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Floating Glass Sidebar */}
      <aside className="w-72 m-4 my-4 bg-white/75 dark:bg-[#0B1426]/90 backdrop-blur-2xl border border-white/80 dark:border-sky-900/40 rounded-3xl flex flex-col justify-between shrink-0 shadow-xl dark:shadow-2xl dark:shadow-sky-950/20 transition-colors duration-300">
        <div>
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-sky-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 dark:from-white dark:via-sky-200 dark:to-cyan-400 bg-clip-text text-transparent">
                  FORENZIQ
                </h1>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 inline" /> AI FORENSICS
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-sky-950/40 transition-all border border-transparent"
            >
              <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Landing Page</span>
            </NavLink>

            <div className="h-px bg-slate-200/60 dark:bg-sky-900/30 my-3" />

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30 dark:shadow-sky-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-sky-950/40'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Account Info */}
        <div className="p-4 border-t border-slate-200/50 dark:border-sky-900/30 space-y-3">
          {user && (
            <div className="flex items-center justify-between bg-white/60 dark:bg-[#070e1e]/80 backdrop-blur-md border border-white/80 dark:border-sky-900/40 p-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'I'}
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name || 'Investigator'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-2 flex justify-between items-center">
            <span>FORENZIQ Engine</span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="System Active" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 my-4 mr-4 overflow-hidden">
        {/* Top Header Bar with Search & Quick Actions */}
        <header className="h-16 px-6 mb-4 flex items-center justify-between bg-white/75 dark:bg-[#0B1426]/90 backdrop-blur-2xl border border-white/80 dark:border-sky-900/40 rounded-3xl shadow-xl dark:shadow-2xl shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search cases, evidence, or hashes..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-100/80 dark:bg-[#070e1e]/80 border border-slate-200/60 dark:border-sky-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Case Workspace Active
            </div>

            <button className="p-2.5 rounded-full bg-slate-100/80 dark:bg-[#070e1e]/80 border border-slate-200/60 dark:border-sky-900/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Workspace View */}
        <div className="flex-1 overflow-y-auto pr-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
