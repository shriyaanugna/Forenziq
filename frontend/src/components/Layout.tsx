import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderLock,
  PlusCircle,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Settings,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases', icon: FolderLock },
    { to: '/cases/new', label: 'New Case', icon: PlusCircle },
    { to: '/images', label: 'Image Vault', icon: ImageIcon },
    { to: '/chats', label: 'Chat & Text Vault', icon: MessageSquare },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="font-extrabold tracking-wider text-xl text-slate-100">FORENZIQ</h1>
              <p className="text-[10px] text-cyan-400 font-mono font-medium tracking-widest uppercase">
                Digital Forensics AI
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Landing Page</span>
            </NavLink>

            <div className="h-px bg-slate-800 my-2" />

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <p className="font-semibold text-slate-400">Phase 1 & Phase 2 Engine Active</p>
          <p className="mt-0.5 font-mono">v1.4.0 — Supabase DB</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <Outlet />
      </main>
    </div>
  );
}
