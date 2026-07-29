import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Eye, 
  AlertCircle,
  FileCheck,
  X,
  File,
  Check,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function DocumentStorage() {
  const { user, token, API_BASE_URL } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload Form State (Student only)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Search & Filter State (Teacher only)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Fetch Documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = `${API_BASE_URL}/documents/my`;
      
      // Teachers fetch all with search/filters
      if (user.role === 'teacher') {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (statusFilter !== 'all') queryParams.append('status', statusFilter);
        if (fileTypeFilter !== 'all') queryParams.append('fileType', fileTypeFilter);
        
        endpoint = `${API_BASE_URL}/documents/all?${queryParams.toString()}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDocuments(data.documents);
      } else {
        throw new Error(data.message || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on mount, and when filters change for teachers
  useEffect(() => {
    fetchDocuments();
  }, [user.role, statusFilter, fileTypeFilter]);

  // Handle Search submit for teachers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  // Real-time status update with SSE (Server-Sent Events)
  useEffect(() => {
    if (!token) return;

    const streamUrl = `${API_BASE_URL}/documents/stream?token=${token}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'STATUS_UPDATE') {
          // Immediately update status of document in student's state
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc._id === data.document._id ? { ...doc, status: data.document.status } : doc
            )
          );
        } else if (data.type === 'NEW_UPLOAD') {
          // If user is a teacher, add the new document to the top of list
          if (user.role === 'teacher') {
            setDocuments((prevDocs) => {
              if (prevDocs.find((d) => d._id === data.document._id)) {
                return prevDocs;
              }
              return [data.document, ...prevDocs];
            });
          }
        }
      } catch (err) {
        console.error('Error parsing SSE updates:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Stream error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token, user.role]);

  // Handle Document Upload (Student only)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !description) return;

    setUploading(true);
    setUploadSuccess(null);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadSuccess('Document uploaded successfully!');
        setTitle('');
        setDescription('');
        setFile(null);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
        setDocuments((prev) => [data.document, ...prev]);
        setTimeout(() => setUploadSuccess(null), 3000);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle Verify Action (Teacher only)
  const handleVerifyDocument = async (docId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === docId ? { ...doc, status: 'verified' } : doc
          )
        );
        
        if (previewDoc && previewDoc._id === docId) {
          setPreviewDoc(prev => ({ ...prev, status: 'verified' }));
        }
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Helper to determine icon based on file type
  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-rose-400" />;
    } else if (mimeType.includes('word') || mimeType.includes('docx')) {
      return <FileCheck className="w-6 h-6 text-blue-400" />;
    } else if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-teal-400" />;
    }
    return <File className="w-6 h-6 text-slate-400" />;
  };

  const getDocUrl = (filename) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://eduassistant.onrender.com/api';
    const base = apiBase.replace(/\/api\/?$/, '');
    return `${base}/uploads/${filename}`;
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Upper Action Panel */}
      <div>
        {user.role === 'student' ? (
          /* Student Upload Interface - Redesigned */
          <div className="glass-panel p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500"></div>

            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2.5 mb-5">
              <Upload className="w-4.5 h-4.5 text-emerald-400" />
              Upload Document for Verification
            </h3>
            
            {uploadSuccess && (
              <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{uploadSuccess}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Text Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="doc-title" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document Title</label>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Science Term Paper Draft"
                    className="glass-input text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="doc-desc" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document Description</label>
                  <textarea
                    id="doc-desc"
                    required
                    rows="3.5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of the file context..."
                    className="glass-input text-xs resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Upload Drop Zone Area */}
              <div className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Choose File</span>
                  
                  <div className={`relative border-2 border-dashed rounded-2xl flex-1 flex flex-col items-center justify-center p-6 bg-slate-950/20 transition-all duration-300 ${
                    file 
                      ? 'border-emerald-500/40 bg-emerald-500/[0.02] shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                      : 'border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/[0.01]'
                  }`}>
                    <input
                      id="file-upload"
                      type="file"
                      required
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    <div className="text-center flex flex-col items-center gap-3.5 pointer-events-none">
                      <div className={`p-3 rounded-2xl border transition-all ${
                        file 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-900/60 border-slate-900 text-slate-400'
                      }`}>
                        <Upload className="w-5.5 h-5.5" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-300 truncate max-w-[280px]">
                          {file ? file.name : 'Drag and drop or click to upload'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">
                          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, DOCX, JPG or PNG up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file || !title || !description}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Submitting File...' : 'Upload for Verification'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Teacher Filter/Search Interface - Redesigned */
          <div className="glass-panel p-5 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-3 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Submission Filter Controls
            </h3>
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, student name, description..."
                  className="glass-input text-xs pl-11 w-full"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
                {/* Status Filter */}
                <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-900 px-3.5 py-2.5 rounded-xl text-[10px] w-full sm:w-auto">
                  <span className="text-slate-500 uppercase font-bold">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="all" className="bg-slate-950">All Files</option>
                    <option value="unverified" className="bg-slate-950">Unverified</option>
                    <option value="verified" className="bg-slate-950">Verified</option>
                  </select>
                </div>

                {/* File Type Filter */}
                <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-900 px-3.5 py-2.5 rounded-xl text-[10px] w-full sm:w-auto">
                  <span className="text-slate-500 uppercase font-bold">Type:</span>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="all" className="bg-slate-950">All Formats</option>
                    <option value="pdf" className="bg-slate-950">PDF Only</option>
                    <option value="docx" className="bg-slate-950">DOCX Only</option>
                    <option value="image" className="bg-slate-950">Images</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider w-full sm:w-auto h-[38px] flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  Filter
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            {user.role === 'student' ? 'My Verification Submissions' : 'Student Submissions Queue'}
          </h3>
          <span className="text-[10px] bg-slate-900/60 border border-slate-800 text-slate-400 px-3 py-1 rounded-full font-bold">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {loading ? (
          <div className="glass-panel p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold mt-2">Loading documents database...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-12 text-center border-red-500/10 bg-red-500/[0.02]">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-red-400">Error Loading Submissions</p>
            <p className="text-[10px] text-slate-500 mt-1">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-panel p-16 text-center border-dashed border-2 border-slate-900 bg-slate-950/10">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400">No documents found</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {user.role === 'student' 
                ? 'Upload assignments or credentials above to submit them for validation.' 
                : 'No student submissions matched the selected filter settings.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documents.map((doc) => {
              const isPdf = doc.fileType === 'application/pdf';
              const isWord = doc.fileType.includes('word') || doc.fileType.includes('docx');
              const isImage = doc.fileType.startsWith('image/');
              
              // Custom side borders representing file type
              let borderClass = 'border-l-brand-500/80';
              let shadowHoverClass = 'hover:shadow-[0_0_20px_rgba(88,113,235,0.02)]';
              let typeBgClass = 'bg-slate-900/60 border-slate-800';

              if (isPdf) {
                borderClass = 'border-l-rose-500';
                shadowHoverClass = 'hover:shadow-[0_0_20px_rgba(244,63,94,0.03)]';
                typeBgClass = 'bg-rose-500/[0.02] border-rose-500/15';
              } else if (isWord) {
                borderClass = 'border-l-blue-500';
                shadowHoverClass = 'hover:shadow-[0_0_20px_rgba(59,130,246,0.03)]';
                typeBgClass = 'bg-blue-500/[0.02] border-blue-500/15';
              } else if (isImage) {
                borderClass = 'border-l-teal-500';
                shadowHoverClass = 'hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]';
                typeBgClass = 'bg-teal-500/[0.02] border-teal-500/15';
              }

              return (
                <div
                  key={doc._id}
                  className={`glass-panel p-5 hover:border-slate-800 hover:bg-slate-900/15 transition-all duration-300 flex items-start gap-4 border-l-4 ${borderClass} ${shadowHoverClass}`}
                >
                  {/* File Type Icon badge */}
                  <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 border ${typeBgClass}`}>
                    {getFileIcon(doc.fileType)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    
                    {/* Header: Title and Status */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-200 truncate pr-1" title={doc.title}>
                        {doc.title}
                      </h4>
                      
                      {/* Status Badges */}
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        doc.status === 'verified'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.08)]'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                      }`}>
                        {doc.status === 'verified' ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-2.5 h-2.5 animate-pulse" />
                            Awaiting
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed" title={doc.description}>
                      {doc.description}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-900/60 text-[10px] text-slate-500">
                      <div className="space-y-0.5">
                        {user.role === 'teacher' && (
                          <p className="font-bold text-purple-400">Student: {doc.uploadedByName}</p>
                        )}
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Preview button */}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 p-2 rounded-xl active:scale-95 transition-all"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download link */}
                        <a
                          href={getDocUrl(doc.filename)}
                          download={doc.originalname}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 p-2 rounded-xl active:scale-95 transition-all flex items-center"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Verify quick action button (Teacher only) */}
                        {user.role === 'teacher' && doc.status === 'unverified' && (
                          <button
                            onClick={() => handleVerifyDocument(doc._id)}
                            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl active:scale-95 transition-all shadow-md shadow-brand-900/30 shrink-0"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redesigned Premium Slide-out Preview Drawer */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
          
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => setPreviewDoc(null)}></div>
          
          {/* Drawer Body - Slides in from right */}
          <div className="relative w-full max-w-2xl h-screen bg-slate-950 border-l border-slate-900 shadow-2xl z-10 flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-900">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/15 px-2.5 py-0.5 rounded-full">
                  Viewer Portal
                </span>
                <h3 className="text-sm font-bold text-slate-200 mt-2 truncate max-w-lg">{previewDoc.title}</h3>
                <p className="text-[10px] text-slate-500">
                  Uploaded by {previewDoc.uploadedByName} ({previewDoc.originalname})
                </p>
              </div>
              
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-200 bg-slate-900/50 p-2 rounded-xl border border-slate-900 hover:border-slate-800 active:scale-95 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Document Render Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 flex items-center justify-center min-h-[300px]">
              {previewDoc.fileType.startsWith('image/') ? (
                <img
                  src={getDocUrl(previewDoc.filename)}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[65vh] object-contain rounded-2xl border border-slate-900 shadow-xl"
                />
              ) : previewDoc.fileType === 'application/pdf' ? (
                <iframe
                  src={getDocUrl(previewDoc.filename)}
                  title={previewDoc.title}
                  className="w-full h-full min-h-[60vh] rounded-2xl border border-slate-900 bg-white"
                />
              ) : (
                /* DOCX or unsupported render */
                <div className="text-center p-8 flex flex-col items-center gap-4 bg-slate-900/20 border border-slate-900 rounded-2xl max-w-sm">
                  <div className="p-4 bg-slate-950 border border-slate-900 text-brand-400 rounded-2xl">
                    <FileCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Word Document Preview Unavailable</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      DOCX documents cannot be rendered directly in-browser. Please download the file locally to inspect and verify.
                    </p>
                  </div>
                  <a
                    href={getDocUrl(previewDoc.filename)}
                    download={previewDoc.originalname}
                    className="btn-primary w-full py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download DOCX File
                  </a>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="p-6 border-t border-slate-900 bg-slate-950/60 flex flex-col gap-4">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Document Description</span>
                <p className="text-xs text-slate-350 leading-relaxed mt-1 italic">
                  "{previewDoc.description}"
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Status:</span>
                  <span className={`text-[9px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    previewDoc.status === 'verified'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}>
                    {previewDoc.status === 'verified' ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Verify button inside drawer (Teacher only) */}
                  {user.role === 'teacher' && previewDoc.status === 'unverified' && (
                    <button
                      onClick={() => handleVerifyDocument(previewDoc._id)}
                      className="btn-primary py-2.5 px-5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify Submission
                    </button>
                  )}
                  
                  {/* Download Inside Drawer */}
                  <a
                    href={getDocUrl(previewDoc.filename)}
                    download={previewDoc.originalname}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
