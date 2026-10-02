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
  User as UserIcon
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
    { to: '/cases', label: 'Cases', icon: FolderLock },
    { to: '/cases/new', label: 'New Case', icon: PlusCircle },
    { to: '/images', label: 'Image Vault', icon: ImageIcon },
    { to: '/chats', label: 'Chat & Text Vault', icon: MessageSquare },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors duration-200 shadow-sm">
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-slate-900 dark:text-cyan-400" />
              <div>
                <h1 className="font-extrabold tracking-wider text-xl text-slate-900 dark:text-slate-100">FORENZIQ</h1>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-medium tracking-widest uppercase">
                  Digital Forensics AI
                </p>
              </div>
            </div>
            <ThemeToggle className="ml-2" />
          </div>

          <nav className="p-4 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800/60 border border-transparent transition-colors"
            >
              <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Landing Page</span>
            </NavLink>

            <div className="h-px bg-slate-200/80 dark:bg-slate-800 my-2" />

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white border border-slate-800 shadow-sm dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
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
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center justify-between bg-slate-100/80 border border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800 p-2.5 rounded-xl">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || 'Investigator'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>FORENZIQ Security Engine</span>
            <span className="block text-slate-500 dark:text-slate-600">Authenticated Session</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-8 transition-colors duration-200">
        <Outlet />
      </main>
    </div>
  );
}
