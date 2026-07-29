import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthCard from './components/AuthCard';
import EasyWritingTool from './components/EasyWritingTool';
import DocumentStorage from './components/DocumentStorage';

function Dashboard({ activeTab }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 relative">
      {/* Decorative Floating Blur Spheres */}
      <div className="fixed top-40 left-[15%] w-[400px] h-[400px] rounded-full bg-brand-500/[0.02] blur-[120px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="fixed bottom-40 right-[15%] w-[350px] h-[350px] rounded-full bg-indigo-500/[0.02] blur-[110px] pointer-events-none -z-10 animate-pulse-subtle" style={{ animationDelay: '-3s' }} />

      {/* Dynamic Tab Body */}
      <main className="transition-all duration-300">
        {activeTab === 'writing' ? (
          <EasyWritingTool />
        ) : (
          <DocumentStorage />
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('writing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-sm font-bold text-slate-300 mt-4 tracking-wider uppercase">Initializing EduAssist...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to server and verifying session</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <AuthCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative">
      {/* Collapsible Sidebar Navigation (desktop only) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Main Dashboard Space */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <div className={`flex-1 py-8 px-4 sm:px-6 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}>
          <Dashboard activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
