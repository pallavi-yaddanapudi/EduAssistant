import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkGrammar } from '../utils/grammarChecker';
import { generateSummary } from '../utils/summarizer';
import { jsPDF } from 'jspdf';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  BookOpen, 
  AlertTriangle, 
  FileText, 
  HelpCircle,
  Undo,
  Sliders,
  PenTool,
  ArrowRight,
  Globe
} from 'lucide-react';

export default function EasyWritingTool() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [wordLimit, setWordLimit] = useState(150);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [remainingWords, setRemainingWords] = useState(wordLimit);
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'restored'

  const textareaRef = useRef(null);

  // Load draft on mount / user change
  useEffect(() => {
    if (user) {
      const savedDraft = localStorage.getItem(`eduassist_draft_${user._id}`);
      if (savedDraft) {
        setText(savedDraft);
        setSaveStatus('restored');
        const timer = setTimeout(() => setSaveStatus('saved'), 3000);
        return () => clearTimeout(timer);
      } else {
        setText('');
        setSaveStatus('saved');
      }
    } else {
      setText('');
    }
    setSummary('');
  }, [user]);

  // Compute counts and save draft whenever text or wordLimit changes
  useEffect(() => {
    let saveTimer;
    if (user && text !== undefined) {
      setSaveStatus('saving');
      localStorage.setItem(`eduassist_draft_${user._id}`, text);
      saveTimer = setTimeout(() => {
        setSaveStatus('saved');
      }, 800);
    }

    // Calculate word count
    const words = text.trim().split(/\s+/).filter(Boolean);
    const currentWordCount = words.length;
    setWordCount(currentWordCount);
    setCharCount(text.length);

    // Calculate remaining
    const remaining = wordLimit - currentWordCount;
    setRemainingWords(remaining >= 0 ? remaining : 0);

    // Run grammar checking (de-bounced or on change)
    const grammarIssues = checkGrammar(text);
    setSuggestions(grammarIssues);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [text, wordLimit, user]);

  // Handle textarea change with strict limit prevention
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const words = newText.trim().split(/\s+/).filter(Boolean);

    // If word count exceeds the limit, truncate the input text to the word limit
    if (words.length > wordLimit) {
      let wordCountTemp = 0;
      let reconstructedText = '';
      const rawWords = newText.split(/(\s+)/); // Keep spaces

      for (let i = 0; i < rawWords.length; i++) {
        const token = rawWords[i];
        if (token.trim().length > 0) {
          wordCountTemp++;
        }
        
        if (wordCountTemp <= wordLimit) {
          reconstructedText += token;
        } else {
          break;
        }
      }
      
      setText(reconstructedText);
    } else {
      setText(newText);
    }
  };

  // Apply grammar correction suggestion
  const handleApplySuggestion = (suggestionItem) => {
    const { index, length, suggestion } = suggestionItem;
    
    const beforeStr = text.substring(0, index);
    const afterStr = text.substring(index + length);
    const updatedText = beforeStr + suggestion + afterStr;
    
    setText(updatedText);
    
    // Focus back on editor
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy Essay Action
  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Clear Essay Action
  const handleClear = () => {
    if (text && window.confirm('Are you sure you want to clear your essay draft?')) {
      setText('');
      setSummary('');
    }
  };

  // Generate Summary Action
  const handleGenerateSummary = () => {
    if (!text.trim()) return;
    setIsGeneratingSummary(true);
    
    setTimeout(() => {
      const generated = generateSummary(text, 2); // Extract top 2 sentences
      setSummary(generated || 'Your essay is too short to generate a summary. Write at least 2-3 sentences.');
      setIsGeneratingSummary(false);
    }, 550);
  };

  // Download essay as PDF
  const handleDownloadPDF = () => {
    if (!text.trim()) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setProperties({
        title: 'EduAssist Essay Export',
        subject: 'Essay',
        author: 'EduAssist Student',
        creator: 'EduAssist'
      });

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(59, 81, 224); // Brand violet-blue
      doc.text('EduAssist Essay Export', 20, 25);
      
      // Subheader
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 32);
      doc.text(`Word count: ${wordCount} / ${wordLimit} words`, 20, 37);

      // Line separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, 42, 190, 42);

      // Body text wrapping
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59); // Slate-800
      
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, 20, 52);

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(`Page ${i} of ${totalPages}`, 95, 285, { align: 'center' });
        doc.text('EduAssist © 2026 - All Rights Reserved', 20, 285);
      }

      doc.save(`essay-export-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };

  // SVG Progress Ring Parameters
  const radius = 32;
  const circumference = 2 * Math.PI * radius; // ~201.06
  const progressPercent = Math.min((wordCount / wordLimit) * 100, 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Color theme for circular progress ring
  let strokeColorClass = 'stroke-brand-500';
  let glowColorClass = 'text-brand-500/10';
  let badgeColorClass = 'bg-brand-500/10 text-brand-400 border-brand-500/20';

  if (progressPercent >= 95) {
    strokeColorClass = 'stroke-red-500 animate-pulse';
    glowColorClass = 'text-red-500/20';
    badgeColorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
  } else if (progressPercent >= 75) {
    strokeColorClass = 'stroke-amber-500';
    glowColorClass = 'text-amber-500/10';
    badgeColorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Editor Pane (8 cols on lg) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Editor Main Window */}
        <div className="glass-panel p-6 shadow-xl relative overflow-hidden">
          
          {/* Subtle top decoration */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600"></div>

          {/* Heading Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-900">
            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-brand-400" />
                Essay Workspace
                
                {/* Draft Auto-save statuses */}
                {saveStatus === 'saving' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse-subtle">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Saving
                  </span>
                )}
                {saveStatus === 'saved' && text.trim().length > 0 && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Saved
                  </span>
                )}
                {saveStatus === 'restored' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
                    Draft Loaded
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">Write your content here. We will enforce your word limit constraint automatically.</p>
            </div>
            
            {/* Word Limit Selector Config */}
            <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-900 px-3.5 py-1.5 rounded-xl">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="wordLimit" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Word Limit:</label>
              <input
                id="wordLimit"
                type="number"
                min="10"
                max="2000"
                value={wordLimit}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setWordLimit(val);
                }}
                className="w-14 bg-transparent text-slate-200 font-extrabold focus:outline-none text-center text-xs"
              />
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Start drafting your essay here... Type 'Today i went to the market and saw a apple.' to see real-time checkers in action."
              className="w-full min-h-[380px] bg-slate-950/40 border border-slate-900 focus:border-brand-500 rounded-2xl p-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/20 transition-all duration-200 font-sans leading-relaxed resize-y"
              style={{ fontSize: '15px' }}
            />
            
            {/* Warning indicator when reaching limit */}
            {remainingWords === 0 && text.trim().length > 0 && (
              <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-3.5 py-1.5 rounded-xl backdrop-blur-md animate-bounce">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-semibold">Word Limit Reached</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-900">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-xs"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled={!text}
                className="btn-secondary flex items-center gap-2 py-2.5 px-4 text-xs"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              
              <button
                onClick={handleClear}
                disabled={!text}
                className="btn-danger flex items-center gap-2 py-2.5 px-4 text-xs"
                title="Clear content"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={!text || isGeneratingSummary}
              className="btn-primary flex items-center gap-2 py-2.5 px-5 text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              {isGeneratingSummary ? 'Processing summary...' : 'Summarize Essay'}
            </button>
          </div>
        </div>

        {/* Display Live Word Metrics Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Circular Progress Ring Card (5 columns) */}
          <div className="md:col-span-5 glass-panel p-5 flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full progress-ring">
                {/* Background Ring */}
                <circle
                  className="text-slate-900 stroke-current"
                  strokeWidth="6"
                  fill="transparent"
                  r={radius}
                  cx="40"
                  cy="40"
                />
                {/* Glowing under-stroke */}
                <circle
                  className={`${glowColorClass} stroke-current progress-ring__circle`}
                  strokeWidth="10"
                  fill="transparent"
                  r={radius}
                  cx="40"
                  cy="40"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
                {/* Dynamic front stroke */}
                <circle
                  className={`${strokeColorClass} progress-ring__circle`}
                  strokeWidth="6"
                  fill="transparent"
                  r={radius}
                  cx="40"
                  cy="40"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Central text percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-extrabold text-[11px] text-slate-300">
                {Math.round(progressPercent)}%
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">Constraint Tracker</h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                You have utilized <span className="font-semibold text-slate-300">{wordCount}</span> of the allowed <span className="font-semibold text-slate-300">{wordLimit}</span> words in this draft.
              </p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${badgeColorClass}`}>
                {remainingWords} remaining
              </span>
            </div>
          </div>
          
          {/* Traditional metrics (7 columns) */}
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Total Characters</span>
              <span className="text-2xl font-extrabold text-slate-200 mt-1">{charCount}</span>
              <span className="text-[9px] text-slate-600 mt-1">Includes spaces & symbols</span>
            </div>
            
            <div className="glass-panel p-5 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Grammar Warnings</span>
              <span className={`text-2xl font-extrabold mt-1 ${suggestions.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {suggestions.length}
              </span>
              <span className="text-[9px] text-slate-600 mt-1">Issues identified in text</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sidebar Suggestions & AI Panel (4 cols on lg) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Grammar Pane */}
        <div className="glass-panel p-5 flex flex-col min-h-[280px] max-h-[420px] shadow-xl relative overflow-hidden">
          
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-indigo-400">
              <PenTool className="w-4 h-4" />
              Editor Suggestions
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              suggestions.length > 0 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {suggestions.length} {suggestions.length === 1 ? 'alert' : 'alerts'}
            </span>
          </h3>

          {/* Suggestion list */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3.5">
            {suggestions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 mt-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs font-bold text-slate-200">No issues found</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-[180px]">Your writing meets all syntax and spelling conditions.</p>
              </div>
            ) : (
              suggestions.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-slate-950/40 border rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-200 ${
                    item.type === 'grammar' 
                      ? 'border-red-500/15 hover:border-red-500/35' 
                      : 'border-amber-500/15 hover:border-amber-500/35'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded ${
                      item.type === 'grammar' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                      Match: "{item.match}"
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-900/50 pt-2.5 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="line-through">"{item.match}"</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-emerald-400 font-bold">"{item.suggestion}"</span>
                    </div>
                    
                    <button
                      onClick={() => handleApplySuggestion(item)}
                      className="bg-brand-600/15 hover:bg-brand-600/30 border border-brand-500/30 text-brand-300 hover:text-brand-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                    >
                      Fix
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summarizer Panel */}
        <div className="glass-panel p-5 min-h-[200px] shadow-xl relative overflow-hidden">
          <h3 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-3 mb-4 flex items-center gap-2 text-brand-400">
            <FileText className="w-4 h-4" />
            Workspace Summary
          </h3>
          
          {summary ? (
            <div className="flex flex-col gap-3.5 animate-fade-in">
              <p className="text-xs text-slate-300 leading-relaxed bg-brand-500/5 border border-brand-500/10 rounded-xl p-4 italic relative">
                "{summary}"
              </p>
              <button
                onClick={() => setSummary('')}
                className="text-[10px] text-slate-500 hover:text-slate-400 flex items-center gap-1.5 self-end font-bold transition-all"
              >
                <Undo className="w-3.5 h-3.5" />
                Reset summary
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 border border-dashed border-slate-900 rounded-2xl bg-slate-950/20">
              <Globe className="w-8 h-8 text-slate-700 mb-2.5" />
              <p className="text-xs font-bold text-slate-400">No summary generated</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] leading-relaxed">Compose your draft, then select the "Summarize Essay" option to generate a condensed digest.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
