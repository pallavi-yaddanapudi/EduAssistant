import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  FileCheck,
  Check
} from 'lucide-react';

export default function AuthCard() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form values
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setValidationError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('student');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoading(true);

    // Basic Validation
    if (isLogin) {
      if (!email.trim() || !password) {
        setValidationError('Please fill in all fields.');
        setLoading(false);
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password || !role) {
        setValidationError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      if (username.length < 3) {
        setValidationError('Username must be at least 3 characters.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password, role);
      }
    } catch (err) {
      console.error(err);
      setValidationError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-3xl border border-slate-900 shadow-2xl shadow-slate-950/80 bg-slate-950/40 backdrop-blur-glass">
      
      {/* Left Column: Premium Feature Showcase (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-brand-950/40 via-slate-950 to-slate-950 border-r border-slate-900/60">
        {/* Floating gradient glow light */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none animate-pulse-subtle" style={{ animationDelay: '-2s' }}></div>

        {/* Brand Logo header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-brand-900/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              EduAssist
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/25 text-brand-400">v1.0</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">AI Writing & Verification Hub</p>
          </div>
        </div>

        {/* Dynamic Marketing Content */}
        <div className="my-auto space-y-8 relative z-10 pt-10">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/25">
              Refine & Verify
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Write Smarter.<br />Verify Instantly.
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The comprehensive learning platform designed to streamline essay editing and secure document validation.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Writing Workspace</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Real-time grammar checkers, custom word limit trackers, and PDF reports.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Document Storage</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Secure student uploads with real-time SSE updates and teacher verification controls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-[10px] text-slate-600 font-medium relative z-10">
          EduAssist © 2026 - Designed for smart academic workflows.
        </div>
      </div>

      {/* Right Column: Authentication Form Card */}
      <div className="col-span-1 lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center relative overflow-hidden bg-slate-950/20">
        {/* Floating gradient glow light (Mobile Only) */}
        <div className="lg:hidden absolute top-0 right-0 w-44 h-44 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
        <div className="lg:hidden absolute bottom-0 left-0 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Header for Mobile Screen */}
        <div className="flex lg:hidden flex-col items-center gap-3 mb-8 text-center relative z-10">
          <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-brand-900/40 animate-pulse-subtle">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Welcome to EduAssist
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              Real-time essay checker and student document storage.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="mb-6">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              {isLogin ? 'Sign In to Account' : 'Create New Account'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {isLogin ? 'Enter your details below to access your dashboard.' : 'Sign up to start writing and uploading files.'}
            </p>
          </div>

          {/* Validation Errors */}
          {validationError && (
            <div className="mb-5 bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-4 py-3 rounded-xl flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{validationError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username (Register only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. JohnDoe"
                    className="glass-input text-xs pl-11 w-full"
                  />
                </div>
              </div>
            )}

            {/* Email / Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isLogin ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLogin ? 'email@domain.com or johndoe' : 'email@domain.com'}
                  className="glass-input text-xs pl-11 w-full"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input text-xs pl-11 w-full"
                />
              </div>
            </div>

            {/* Role Selection (Register only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Portal Role</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 px-4 rounded-xl border font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      role === 'student'
                        ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-md shadow-brand-900/10'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2.5 px-4 rounded-xl border font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      role === 'teacher'
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md shadow-purple-900/10'
                        : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Teacher
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-xs text-slate-500 mt-6 pt-5 border-t border-slate-900">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="text-brand-400 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
