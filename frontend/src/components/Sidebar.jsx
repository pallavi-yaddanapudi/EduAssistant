import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  FolderUp, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Sparkles,
  Server
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    {
      id: 'writing',
      label: 'Writing Workspace',
      icon: Sparkles,
      description: 'AI-assisted essay editor'
    },
    {
      id: 'documents',
      label: 'Document Storage',
      icon: FolderUp,
      description: 'Verify and store files'
    }
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-30 glass-sidebar py-6 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Area */}
      <div className={`px-6 flex items-center justify-between mb-8 transition-all duration-300 ${
        isCollapsed ? 'justify-center px-0' : ''
      }`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2 rounded-xl shadow-md shadow-brand-900/40">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-1.5">
                EduAssist
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400">v1.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Advanced Learning</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-brand-900/40 hover:scale-105 transition-all">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 p-1 rounded-full shadow-lg hover:border-brand-500/30 transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group ${isActive ? 'nav-item-active' : 'nav-item'} ${
                isCollapsed ? 'justify-center px-0 py-3.5' : 'justify-between'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                  isActive ? 'text-brand-400' : 'text-slate-400'
                }`} />
                {!isCollapsed && (
                  <div className="text-left animate-fade-in">
                    <p className="font-semibold text-xs leading-none">{item.label}</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5 group-hover:text-slate-400 transition-colors">{item.description}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout Info */}
      <div className="mt-auto border-t border-slate-900 pt-5 px-3 space-y-4">
        {/* User Card */}
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/20 border border-slate-900/50 ${
          isCollapsed ? 'justify-center px-0 bg-transparent border-transparent' : ''
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            user.role === 'teacher' 
              ? 'bg-purple-500/10 border-purple-500/25 text-purple-400' 
              : 'bg-brand-500/10 border-brand-500/25 text-brand-400'
          }`} title={`${user.username} (${user.role})`}>
            <User className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-200 truncate">{user.username}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  user.role === 'teacher' 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {user.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          )}
        </div>

        {/* Database / Server connection indicator */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 text-[10px] text-slate-500">
            <Server className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium truncate">Database online</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 border border-transparent rounded-xl px-4 py-3 text-xs font-semibold transition-all duration-200 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Log Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="animate-fade-in">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
