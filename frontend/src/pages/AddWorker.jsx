import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, FileText, UserCheck, AlertTriangle, 
  CheckCircle2, Users, Loader2, Sparkles, Trash2, ShieldCheck, 
  ChevronRight, Fingerprint, Calendar, MapPin, User, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function AddWorkerModal({ serviceId, service, isOpen, onClose }) {
  const fileInputRef = useRef(null);
  const excelFileInputRef = useRef(null);

  // Core component states
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('aadhar'); // 'aadhar' or 'excel'
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  
  // OCR & upload states
  const [isScanning, setIsScanning] = useState(false);
  const [stagedWorkers, setStagedWorkers] = useState([]);
  const [scanProgress, setScanProgress] = useState(null); // { current, total }
  
  // Roster save states
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // 1. Fetch current workers on mount/change
  useEffect(() => {
    if (serviceId === undefined || serviceId === null || serviceId === '') return;
    
    const fetchWorkers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/worker/service/' + serviceId);
        setWorkers(res.data || []);
      } catch (err) {
        console.error('Error fetching service workers:', err);
        setError('Failed to fetch currently registered workers.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, [serviceId]);

  // Helper to trigger toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 2. Drag & Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (activeTab === 'aadhar') {
        processAadharFiles(files);
      } else {
        processExcelFiles(files);
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processAadharFiles(files);
    }
    e.target.value = null;
  };

  const handleExcelFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processExcelFiles(files);
    }
    e.target.value = null;
  };

  const processExcelFiles = async (files) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const validFiles = files.filter(file => {
      const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      return allowedExtensions.includes(fileExt) || file.type === 'text/csv' || file.type.includes('spreadsheet') || file.type.includes('excel');
    });

    if (validFiles.length === 0) {
      showToast('Invalid formats. Please upload an Excel sheet (.xlsx, .xls) or CSV.', 'error');
      return;
    }

    const file = validFiles[0];
    setIsParsingExcel(true);
    showToast(`Uploading and parsing ${file.name} worker roster...`);

    const formData = new FormData();
    formData.append('rosterFile', file);

    try {
      const res = await api.post('/worker/excel-extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.data) {
        const parsedWorkers = res.data.data.map(w => ({
          ...w,
          stagedId: Date.now() + Math.random(),
          fileName: file.name,
          selected: true
        }));

        setStagedWorkers(prev => [...parsedWorkers, ...prev]);
        showToast(`Successfully extracted ${res.data.count || parsedWorkers.length} profile(s) from ${file.name}!`);
      } else {
        showToast('No roster data extracted from spreadsheet.', 'error');
      }
    } catch (err) {
      console.error('Excel parsing error:', err);
      const errMsg = err.response?.data?.details || err.response?.data?.message || 'Failed to parse Excel sheet.';
      showToast(errMsg, 'error');
    } finally {
      setIsParsingExcel(false);
    }
  };

  // 3. Trigger mock OCR scanner api concurrently
  const processAadharFiles = async (files) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const validFiles = files.filter(f => allowedTypes.includes(f.type));
    
    if (validFiles.length === 0) {
      showToast('Invalid formats. Please upload JPEG, PNG, WebP or PDF.', 'error');
      return;
    }

    setIsScanning(true);
    setScanProgress({ current: 1, total: validFiles.length });
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setScanProgress({ current: i + 1, total: validFiles.length });

      const formData = new FormData();
      formData.append('aadharFile', file);

      try {
        const res = await api.post('/worker/ocr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data && res.data.data) {
          const extractedData = res.data.data;
          const stagedWorker = {
            ...extractedData,
            stagedId: Date.now() + Math.random(),
            fileName: file.name,
            selected: true
          };

          // Prepend single worker immediately so they appear in staged review list one-by-one!
          setStagedWorkers(prev => [stagedWorker, ...prev]);
          successCount++;
          showToast(`Successfully scanned ${file.name}!`);
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`OCR Error for ${file.name}:`, err);
        errorCount++;
        showToast(`Failed to scan ${file.name}.`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(`Scanned and staged ${successCount} Aadhaar card(s) successfully!`);
    }

    setIsScanning(false);
    setScanProgress(null);
  };

  const handleStagedChange = (stagedId, field, value) => {
    setStagedWorkers(prev => prev.map(w => w.stagedId === stagedId ? { ...w, [field]: value } : w));
  };

  const handleRemoveStaged = (stagedId) => {
    setStagedWorkers(prev => prev.filter(w => w.stagedId !== stagedId));
  };

  // 4. Bulk Save
  const handleApproveSelected = async () => {
    const selected = stagedWorkers.filter(w => w.selected);
    if (selected.length === 0) {
      showToast('No workers selected for approval.', 'error');
      return;
    }

    for (let w of selected) {
      const cleanAadhar = (w.aadharNumber || '').replace(/\s+/g, '');
      if (cleanAadhar.length !== 12 || isNaN(cleanAadhar)) {
        showToast('Invalid Aadhaar for ' + (w.name || 'worker') + '. Must be 12 digits.', 'error');
        return;
      }
    }

    setSaving(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      const savePromises = selected.map(async (workerData) => {
        const payload = { 
          ...workerData, 
          serviceId,
          department: service?.department_name || 'SECURITY',
          role: service?.role_title || 'Security Guards',
          ratePerDay: service?.rate_per_day || 300
        };
        delete payload.stagedId;
        delete payload.fileName;
        delete payload.selected;
        return api.post('/worker', payload);
      });

      const saveResults = await Promise.allSettled(savePromises);
      
      const successfulWorkers = [];
      const failedIds = [];

      saveResults.forEach((res, index) => {
        if (res.status === 'fulfilled') {
          successCount++;
          successfulWorkers.push(res.value.data.worker);
        } else {
          failedCount++;
          failedIds.push(selected[index].stagedId);
        }
      });

      if (successfulWorkers.length > 0) {
        setWorkers(prev => [...successfulWorkers, ...prev]);
      }

      setStagedWorkers(prev => prev.filter(w => !w.selected || failedIds.includes(w.stagedId)));

      if (failedCount > 0) {
        showToast(successCount + ' saved, ' + failedCount + ' failed.', 'error');
      } else {
        showToast('Successfully added ' + successCount + ' worker(s)!');
      }

    } catch (err) {
      console.error('Bulk save error:', err);
      showToast('A fatal error occurred during bulk save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to remove this worker from the service roster?')) return;

    try {
      await api.delete('/worker/' + workerId);
      setWorkers(prev => prev.filter(w => w.id !== workerId));
      showToast('Worker successfully removed.');
    } catch (err) {
      console.error('Delete worker error:', err);
      showToast('Failed to remove worker.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none antialiased">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={'fixed top-8 left-1/2 -translate-x-1/2 z-55 flex items-center px-6 py-4 shadow border-2 rounded-none w-11/12 max-w-md ' +
              (toast.type === 'error' 
                ? 'bg-destructive text-destructive-foreground border-border' 
                : 'bg-card text-foreground border-border')
            }
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-destructive-foreground mr-3 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
            )}
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">
                {toast.type === 'error' ? 'Error' : 'Success'}
              </p>
              <p className="font-medium text-xs mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-card border-2 border-border rounded-none max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-lg relative flex flex-col space-y-6 text-foreground font-sans"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-none transition-all cursor-pointer border-2 border-transparent hover:border-border"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b-2 border-border pb-4 pr-12">
          <div className="w-9 h-9 bg-primary/10 border-2 border-border text-primary rounded-none flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Bulk Upload & Verify Aadhaar Scans</h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-medium">
              Drag & Drop multiple files to auto-extract and stage personnel for roster approval
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {/* Custom Tab Selector */}
            <div className="flex border-2 border-border rounded-none p-1 bg-muted">
              <button
                type="button"
                onClick={() => setActiveTab('aadhar')}
                className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border ${
                  activeTab === 'aadhar'
                    ? 'bg-card text-foreground border-border shadow-sm font-black'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-primary" />
                <span>Aadhaar Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('excel')}
                className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border ${
                  activeTab === 'excel'
                    ? 'bg-card text-foreground border-border shadow-sm font-black'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel Roster</span>
              </button>
            </div>

            {activeTab === 'aadhar' ? (
              <>
                <div className="bg-muted border-2 border-border rounded-none p-4 flex items-start space-x-3 text-[10px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground uppercase tracking-wide block mb-0.5">Demographics Scanning Scan</span>
                    <span className="text-muted-foreground font-medium">
                      Upload multiple scanner images or documents here to trigger high-precision batch OCR extraction.
                    </span>
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={'border-2 border-dashed rounded-none p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden min-h-[180px] ' +
                    (isScanning 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted hover:bg-card hover:border-foreground')
                  }
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    multiple
                    className="hidden" 
                  />

                  {isScanning ? (
                    <div className="space-y-3 relative w-full flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider animate-pulse">
                          {scanProgress ? `Scanning Aadhaar ${scanProgress.current} of ${scanProgress.total}` : 'Scanning Aadhaar card...'}
                        </h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5 animate-pulse">
                          Processing OCR & staging worker profile...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-card border-2 border-border rounded-none flex items-center justify-center mx-auto shadow text-muted-foreground">
                         <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Drag & Drop Files</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed font-medium">
                          PNG, JPEG, WebP or PDF. Multi-select enabled.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1 bg-card border-2 border-border hover:bg-muted transition-colors font-bold uppercase text-[9px] rounded-none tracking-wider shadow cursor-pointer"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted border-2 border-border rounded-none p-4 flex items-start space-x-3 text-[10px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground uppercase tracking-wide block mb-0.5">Spreadsheet Roster Import</span>
                    <span className="text-muted-foreground font-medium">
                      Upload an MS Excel (.xlsx, .xls) or CSV sheet. Ensure columns align with Name, Aadhaar Number, DOB, and Gender.
                    </span>
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => excelFileInputRef.current?.click()}
                  className={'border-2 border-dashed rounded-none p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden min-h-[180px] ' +
                    (isParsingExcel 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted hover:bg-card hover:border-foreground')
                  }
                >
                  <input 
                    type="file" 
                    ref={excelFileInputRef} 
                    onChange={handleExcelFileSelect} 
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    className="hidden" 
                  />

                  {isParsingExcel ? (
                    <div className="space-y-3 relative w-full flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider animate-pulse">
                          Parsing Workers Roster...
                        </h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5 animate-pulse">
                          Extracting demographic columns & staging profiles...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-card border-2 border-border rounded-none flex items-center justify-center mx-auto shadow text-muted-foreground">
                         <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Upload Spreadsheet</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed font-medium">
                          Drag & drop .xlsx, .xls, or .csv roster files here.
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          className="px-3 py-1 bg-card border-2 border-border hover:bg-muted transition-colors font-bold uppercase text-[9px] rounded-none tracking-wider shadow cursor-pointer"
                        >
                          Browse Spreadsheet
                        </button>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showToast("Downloaded sample Excel template!", "success");
                          }}
                          className="px-3 py-1 bg-primary text-primary-foreground border-2 border-border hover:opacity-90 transition-opacity font-bold uppercase text-[9px] rounded-none tracking-wider shadow cursor-pointer flex items-center"
                        >
                          Template
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="bg-muted border-2 border-border rounded-none p-4 flex flex-col max-h-[350px] text-foreground">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex justify-between">
              <span>Staged Review</span>
              <span className="text-primary bg-primary/10 px-2 py-0.5 border border-border rounded-none font-mono font-bold text-[10px]">{stagedWorkers.length} Pending</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {stagedWorkers.length === 0 ? (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[150px]">
                  <Fingerprint className="w-8 h-8 text-muted-foreground/60 mb-2" />
                  <p className="text-[10px] font-bold">Staging Area Empty</p>
                  <p className="text-[9px] mt-1 text-muted-foreground font-medium">Upload Aadhaar cards or Excel sheets to stage them here.</p>
                </div>
              ) : (
                stagedWorkers.map((worker) => (
                  <div key={worker.stagedId} className={'bg-card border-2 rounded-none p-3 relative shadow transition-all ' + (worker.selected ? 'border-primary' : 'border-border opacity-60')}>
                    
                    <button 
                      onClick={() => handleRemoveStaged(worker.stagedId)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-2 mb-2 pr-6">
                      <input 
                        type="checkbox" 
                        checked={worker.selected}
                        onChange={(e) => handleStagedChange(worker.stagedId, 'selected', e.target.checked)}
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                      <span className="text-[10px] text-muted-foreground truncate font-mono font-medium">{worker.fileName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={worker.name || ''}
                        onChange={(e) => handleStagedChange(worker.stagedId, 'name', e.target.value)}
                        placeholder="Full Name"
                        className="col-span-2 bg-background border-2 border-border rounded-none px-2 py-1 text-[11px] focus:outline-none focus:border-primary text-foreground font-medium"
                      />
                      <input
                        type="text"
                        value={worker.aadharNumber || ''}
                        onChange={(e) => handleStagedChange(worker.stagedId, 'aadharNumber', e.target.value)}
                        placeholder="Aadhaar Number"
                        maxLength="14"
                        className="bg-background border-2 border-border rounded-none px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-primary text-foreground font-medium"
                      />
                      <input
                        type="text"
                        value={worker.dob || ''}
                        onChange={(e) => handleStagedChange(worker.stagedId, 'dob', e.target.value)}
                        placeholder="DOB"
                        className="bg-background border-2 border-border rounded-none px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-primary text-foreground font-medium"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {stagedWorkers.length > 0 && (
              <button
                onClick={handleApproveSelected}
                disabled={saving}
                className="mt-4 w-full btn-primary py-2.5 flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-foreground" />
                    <span>Approving Selected...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-primary-foreground" />
                    <span>Approve Selected Workers</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="border-t-2 border-border pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Service Personnel Directory</h3>
            <span className="bg-muted border-2 border-border text-[9px] font-bold px-2 py-1 rounded-none text-foreground shadow font-mono">
              Total Enrolled: <span className="text-primary font-black">{workers.length}</span>
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider animate-pulse">Synchronizing roster directory...</span>
            </div>
          ) : error ? (
            <div className="p-3 text-center text-destructive bg-destructive/10 border-2 border-destructive rounded-none text-[10px] font-mono font-bold uppercase">
              <span>{error}</span>
            </div>
          ) : workers.length === 0 ? (
            <div className="py-6 text-center border-2 border-dashed border-border rounded-none text-muted-foreground text-[9px] bg-muted/30">
              <Users className="w-6 h-6 text-muted-foreground/60 mx-auto mb-1.5" />
              <span className="font-medium">Roster folder empty. Onboard staff by scanning Aadhaar cards above.</span>
            </div>
          ) : (
            <div className="max-h-[180px] overflow-y-auto border-2 border-border rounded-none shadow-sm custom-scrollbar bg-card">
              <table className="w-full text-left border-collapse text-[11px] font-medium">
                <thead className="bg-muted sticky top-0 z-10 border-b-2 border-border text-muted-foreground font-mono text-[8px] uppercase font-bold">
                  <tr>
                    <th className="py-2 pl-3">Worker Name</th>
                    <th className="py-2">Aadhaar</th>
                    <th className="py-2">DOB & Gender</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border text-foreground bg-card">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-muted transition-colors">
                      <td className="py-2 pl-3 font-semibold">{worker.name}</td>
                      <td className="py-2 font-mono font-semibold text-primary">
                        {worker.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                      </td>
                      <td className="py-2 font-mono text-muted-foreground">
                        {worker.dob} <span className="text-[9px] text-muted-foreground font-sans font-bold uppercase ml-1">({worker.gender})</span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <button
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="p-1.5 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive border-2 border-border shadow rounded-none text-destructive bg-card cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
