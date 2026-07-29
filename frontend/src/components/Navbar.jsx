import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  User, 
  Sparkles, 
  BookOpen, 
  FolderUp, 
  Menu,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isSidebarCollapsed }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const currentTabLabel = activeTab === 'writing' ? 'Writing Workspace' : 'Document Storage';

  return (
    <>
      {/* Top Header Bar */}
      <header 
        className={`w-full py-4 px-6 border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-glass sticky top-0 z-20 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* Left section: Breadcrumbs (Desktop) / Brand (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Desktop Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="hover:text-slate-400 cursor-pointer">Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-400 font-bold tracking-wide">{currentTabLabel}</span>
            </div>

            {/* Mobile Logo */}
            <div className="flex md:hidden items-center gap-2.5">
              <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-md font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                EduAssist
              </h1>
            </div>
          </div>

          {/* Right section: Profile & Logout */}
          <div className="flex items-center gap-4">
            {/* Server Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Connection
            </div>

            {/* User Session Info */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${
                user.role === 'teacher' 
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                  : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
              }`}>
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{user.username}</p>
                <p className="text-[9px] uppercase font-bold text-slate-500">{user.role}</p>
              </div>
            </div>

            {/* Logout (Mobile icon button, Desktop sidebar handles logout) */}
            <button
              onClick={logout}
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 active:scale-95 transition-all"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Floating Bottom Navigation Bar (Mobile only) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30 animate-scale-in">
        <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800/80 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl shadow-slate-950/65">
          <button
            onClick={() => setActiveTab('writing')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 w-1/2 ${
              activeTab === 'writing'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-wide">Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 w-1/2 ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderUp className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-wide">Files</span>
          </button>
        </div>
      </div>
    </>
  );
}
