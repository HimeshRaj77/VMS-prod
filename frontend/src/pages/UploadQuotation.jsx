import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function UploadQuotation() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    setError(null);

    try {
      const response = await api.post('/quotation/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Trigger elegant toast notification
      setToast({
        message: 'Successful PDF uploaded! Structuring document details...',
        type: 'success'
      });

      // Redirect after showing the toast briefly
      if (response.data?.quotationId) {
        setTimeout(() => {
          navigate(`/quotation/${response.data.quotationId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to upload and extract text.';
      const errorDetails = err.response?.data?.details;
      const displayError = errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage;
      setError(displayError);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center min-h-[80vh]">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-emerald-50 border-2 border-emerald-500 text-emerald-900 px-6 py-4 shadow-xl rounded-none max-w-md w-11/12"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-800">Success</p>
              <p className="font-medium text-sm mt-0.5">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3  border border-primary/20 mb-4 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI-Powered Quotation Extraction</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Manpower Quotation</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Upload your agency's PDF proposal. Our neural parsing engine will automatically extract payment milestones, headcount figures, service categories, and financial indicators in seconds.
        </p>
      </div>

      {/* Focus Upload Area Card */}
      <div className="w-full max-w-2xl bg-white border-2 border-border p-8 shadow-brutal flex flex-col gap-6">
        {/* Info Banner explaining replacement limit */}
        <div className="bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-950">Active Quotation Limit:</span> You are allowed to store <span className="font-bold text-primary">one active quotation</span> on the system. Uploading a new quotation PDF will automatically remove your previously uploaded PDF and replace it in our system.
          </div>
        </div>

        <div 
          className={`border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-12 text-center cursor-pointer min-h-[220px]
            ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}
            ${file ? 'bg-slate-50 border-solid border-slate-200' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <File className="w-8 h-8 text-brand-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-md">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              {!uploading && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider border-b border-transparent hover:border-red-500"
                >
                  Change file
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-brand-100 rounded-none flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Click to select PDF or drag it here</h3>
              <p className="text-xs text-slate-500">PDF documents only (maximum 10MB)</p>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 border border-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 whitespace-pre-line font-mono text-xs">{error}</div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || toast}
          className="btn-primary w-full py-4 text-sm font-extrabold flex justify-center items-center shadow-lg uppercase tracking-wider"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Neural Extraction & AI Structuring...
            </>
          ) : toast ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2 text-brand-200 animate-pulse" />
              Processing Successful! Redirecting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Upload and Analyze Quotation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
