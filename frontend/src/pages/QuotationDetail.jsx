import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Coins, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  AlertTriangle,
  Zap,
  Info,
  Sparkles,
  Edit,
  Save,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AddWorkerModal from './AddWorker';

export default function QuotationDetail() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services'); // services, terms, metadata
  const [expandedServices, setExpandedServices] = useState({});

  // Interactive editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null); // { message, type }

  // Worker Modal States
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get(`/quotation/${id}`, { headers });
        setQuotation(response.data);
      } catch (err) {
        console.error('Error fetching quotation details:', err);
        setError(err.response?.data?.message || 'Failed to fetch quotation details.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const toggleService = (srvId) => {
    setExpandedServices(prev => ({
      ...prev,
      [srvId]: !prev[srvId]
    }));
  };

  // Start editing handler - clones current structuredData
  const handleStartEdit = () => {
    const structured = quotation.structuredQuotation || quotation.StructuredQuotation;
    if (structured && structured.structuredData) {
      setEditData(JSON.parse(JSON.stringify(structured.structuredData)));
      setIsEditing(true);
    }
  };

  // General field update
  const handleUpdateGeneral = (field, value) => {
    setEditData(prev => {
      const copy = { ...prev };
      if (!copy.quotation_meta) copy.quotation_meta = {};
      
      if (field === 'final_total_after_gst' || field === 'total_manpower' || field === 'quotation_validity_days') {
        copy.quotation_meta[field] = value === '' ? 0 : parseInt(value) || 0;
      } else {
        copy.quotation_meta[field] = value;
      }
      return copy;
    });
  };

  // Service item updates with auto-calculations & original tax multiplier preservation
  const handleUpdateService = (idx, field, value) => {
    setEditData(prev => {
      const copy = { ...prev };
      if (!copy.line_items) copy.line_items = [];
      const services = [...copy.line_items];
      const srv = { ...services[idx] };
      
      if (['department_name', 'role_title', 'manpower_type', 'remarks'].includes(field)) {
        srv[field] = value;
      } else {
        const numVal = value === '' ? 0 : parseFloat(value) || 0;
        srv[field] = numVal;
      }

      // Recalculate Service Subtotal on changes
      if (['quantity', 'rate_per_day', 'duration_days', 'shifts_per_day'].includes(field)) {
        const count = srv.quantity || 0;
        const rate = srv.rate_per_day || 0;
        const duration = srv.duration_days || 0;
        const shifts = srv.shifts_per_day || 1; // Safeguard shift to default 1
        srv.subtotal = Math.round(count * rate * duration * shifts);
      }

      services[idx] = srv;
      copy.line_items = services;

      // Recalculate top-level aggregates
      const totalManpower = services.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const totalBeforeGst = services.reduce((sum, s) => sum + (s.subtotal || 0), 0);
      
      const structured = quotation.structuredQuotation || quotation.StructuredQuotation;
      const originalBeforeGst = structured?.structuredData?.quotation?.grand_total_before_gst || 1;
      const originalAfterGst = structured?.structuredData?.quotation?.final_total_after_gst || 1;
      const gstMultiplier = originalBeforeGst > 0 ? (originalAfterGst / originalBeforeGst) : 1.18;

      if (!copy.quotation_meta) copy.quotation_meta = {};
      copy.quotation_meta.total_manpower = totalManpower;
      copy.quotation_meta.grand_total_before_gst = totalBeforeGst;
      copy.quotation_meta.final_total_after_gst = Math.round(totalBeforeGst * (gstMultiplier || 1.18));
      copy.quotation_meta.total_services = services.length;

      return copy;
    });
  };

  // Payment Milestone updates
  const handleUpdatePaymentTerm = (idx, field, value) => {
    setEditData(prev => {
      const copy = { ...prev };
      if (!copy.payment_terms) copy.payment_terms = [];
      const terms = [...copy.payment_terms];
      const term = { ...terms[idx] };

      if (field === 'stage_name') {
        term[field] = value;
      } else {
        term[field] = value === '' ? 0 : parseFloat(value) || 0;
      }

      terms[idx] = term;
      copy.payment_terms = terms;
      return copy;
    });
  };

  // Obligation & Risk lists newline parser
  const handleUpdateList = (listField, textValue) => {
    setEditData(prev => {
      const copy = { ...prev };
      if (!copy.quotation_meta) copy.quotation_meta = {};
      
      const listArray = textValue
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
        
      copy.quotation_meta[listField] = listArray;
      return copy;
    });
  };

  // PUT database save handler
  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.put(`/quotation/${id}`, {
        structuredData: editData
      }, { headers });

      // Live update of view data
      setQuotation(prev => ({
        ...prev,
        structuredQuotation: response.data.quotation.structuredQuotation
      }));

      setSaveToast({
        message: 'Changes saved successfully in real-time!',
        type: 'success'
      });

      setTimeout(() => {
        setSaveToast(null);
        setIsEditing(false);
      }, 2000);

    } catch (err) {
      console.error('Error saving edits:', err);
      setError(err.response?.data?.message || 'Failed to update quotation changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Running advanced structured document parsing...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-destructive/10 border-2 border-destructive text-destructive p-6 rounded-none shadow-brutal flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">Extraction Review Failure</h3>
            <p className="text-sm opacity-90">{error || 'Quotation details could not be found or loaded.'}</p>
            <Link to={localStorage.getItem('adminToken') ? "/admin/dashboard" : "/upload"} className="inline-flex items-center text-sm font-semibold underline mt-4 hover:opacity-80">
              <ArrowLeft className="w-4 h-4 mr-2" /> {localStorage.getItem('adminToken') ? 'Back to Dashboard' : 'Upload New Quotation'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const structured = quotation.structuredQuotation || quotation.StructuredQuotation;
  if (!structured) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="border-2 border-border p-8 bg-card shadow-brutal">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Processing Still In Progress</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            The quotation text is extracted, but AI structured normalization is either pending or encountered a warning.
          </p>
          <Link to={localStorage.getItem('adminToken') ? "/admin/dashboard" : "/upload"} className="btn-primary inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> {localStorage.getItem('adminToken') ? 'Back to Dashboard' : 'Upload New Quotation'}
          </Link>
        </div>
      </div>
    );
  }

  const sd = isEditing ? editData : structured.structuredData;
  const qData = sd.quotation_meta || {};
  const services = sd.line_items || [];
  const paymentTerms = sd.payment_terms || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-emerald-50 border-2 border-emerald-500 text-emerald-950 px-6 py-4 shadow-xl rounded-none w-11/12 max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-800">Success</p>
              <p className="font-medium text-sm mt-0.5">{saveToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header with edit triggers */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link 
          to={localStorage.getItem('adminToken') ? '/admin/dashboard' : '/upload'} 
          className="inline-flex items-center text-sm font-semibold hover:underline bg-card px-3 py-1.5 border-2 border-border shadow-brutal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {localStorage.getItem('adminToken') ? 'Back to List' : 'Upload New Quotation'}
        </Link>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button 
              onClick={handleStartEdit}
              className="inline-flex items-center text-sm font-bold bg-primary text-primary-foreground px-4 py-1.5 border-2 border-border shadow-brutal hover:bg-primary/95 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Quotation
            </button>
          ) : (
            <>
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center text-sm font-bold bg-emerald-600 text-white px-4 py-1.5 border-2 border-border shadow-brutal hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="inline-flex items-center text-sm font-bold bg-card text-foreground px-4 py-1.5 border-2 border-border shadow-brutal hover:bg-muted transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" /> Cancel
              </button>
            </>
          )}
          
          <div className="hidden md:flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 border-2 border-border font-bold text-sm shadow-brutal">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI Quotation Intelligence Portal</span>
          </div>
        </div>
      </div>

      {/* Hero Branding Section */}
      <div className="bg-card border-4 border-border p-6 sm:p-8 mb-8 shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="bg-primary text-primary-foreground font-black text-xs px-2.5 py-1 uppercase border-2 border-border">
                {qData.quotation_type || 'Services'}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <FileText className="w-3.5 h-3.5" /> ID: {qData.quotation_id || quotation.id.slice(0, 8)}
              </span>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Vendor Company</label>
                  <input
                    type="text"
                    value={qData.agency_name || ''}
                    onChange={(e) => handleUpdateGeneral('agency_name', e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-1.5 font-bold text-foreground text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Event/Project Name</label>
                  <input
                    type="text"
                    value={qData.event_name || ''}
                    onChange={(e) => handleUpdateGeneral('event_name', e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-1.5 font-bold text-foreground text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Event Location</label>
                  <input
                    type="text"
                    value={qData.event_location || ''}
                    onChange={(e) => handleUpdateGeneral('event_location', e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-1.5 font-bold text-foreground text-sm focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                  {qData.agency_name || 'Quoted Vendor Provider'}
                </h1>
                
                <p className="text-lg font-bold text-muted-foreground">
                  Project: <span className="text-foreground">{qData.event_name || 'N/A'}</span>
                </p>
                {qData.event_location && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Location: <span className="font-semibold text-foreground">{qData.event_location}</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Executive Key Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border-2 border-border p-5 shadow-brutal flex items-start gap-4">
          <div className="bg-primary/10 border-2 border-primary text-primary p-3 rounded-none">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Grand Total (Incl. GST)</p>
            {isEditing ? (
              <div className="mt-1 font-mono">
                <input
                  type="number"
                  value={qData.final_total_after_gst === undefined ? '' : qData.final_total_after_gst}
                  onChange={(e) => handleUpdateGeneral('final_total_after_gst', e.target.value)}
                  className="w-full bg-background border-2 border-border px-2 py-0.5 font-bold text-foreground text-sm focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block mt-1 font-sans">₹{(qData.grand_total_before_gst || 0).toLocaleString('en-IN')} pre-GST</span>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mt-1 text-foreground">
                  {qData.final_total_after_gst ? `₹${qData.final_total_after_gst.toLocaleString('en-IN')}` : 'N/A'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Before GST: ₹{(qData.grand_total_before_gst || 0).toLocaleString('en-IN')}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border-2 border-border p-5 shadow-brutal flex items-start gap-4">
          <div className="bg-accent/10 border-2 border-accent text-accent p-3 rounded-none">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Headcount</p>
            {isEditing ? (
              <div className="mt-1 font-mono">
                <input
                  type="number"
                  value={qData.total_manpower === undefined ? '' : qData.total_manpower}
                  onChange={(e) => handleUpdateGeneral('total_manpower', e.target.value)}
                  className="w-full bg-background border-2 border-border px-2 py-0.5 font-bold text-foreground text-sm focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block mt-1 font-sans">Sum of service staff counts</span>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mt-1 text-foreground">
                  {qData.total_manpower || 'N/A'} Personnel
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {qData.total_services || 0} service domains
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border-2 border-border p-5 shadow-brutal flex items-start gap-4">
          <div className="bg-secondary/10 border-2 border-secondary text-secondary-foreground p-3 rounded-none">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Quote Validity</p>
            {isEditing ? (
              <div className="mt-1 font-mono">
                <input
                  type="number"
                  value={qData.quotation_validity_days === undefined ? '' : qData.quotation_validity_days}
                  onChange={(e) => handleUpdateGeneral('quotation_validity_days', e.target.value)}
                  className="w-full bg-background border-2 border-border px-2 py-0.5 font-bold text-foreground text-sm focus:outline-none"
                />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black mt-1 text-foreground">
                  {qData.quotation_validity_days || '30'} Days
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  From upload date
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border-2 border-border p-5 shadow-brutal flex items-start gap-4">
          <div className="bg-green-500/10 border-2 border-green-500 text-green-600 dark:text-green-400 p-3 rounded-none">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contact Personnel</p>
            {isEditing ? (
              <div className="mt-1 space-y-1 font-mono">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={qData.contact_person || ''}
                  onChange={(e) => handleUpdateGeneral('contact_person', e.target.value)}
                  className="w-full bg-background border-2 border-border px-2 py-0.5 text-xs font-bold text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Email"
                  value={qData.contact_email || ''}
                  onChange={(e) => handleUpdateGeneral('contact_email', e.target.value)}
                  className="w-full bg-background border-2 border-border px-2 py-0.5 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>
            ) : (
              <>
                <h3 className="text-lg font-black mt-1 text-foreground">
                  {qData.contact_person || 'Vendor Staff'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {qData.contact_email || 'N/A'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b-4 border-border mb-8 overflow-x-auto gap-2">
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 font-black text-sm uppercase border-t-2 border-x-2 border-border -mb-1 transition-all shrink-0 ${
            activeTab === 'services' 
              ? 'bg-card text-foreground border-b-4 border-b-card translate-y-1 z-10' 
              : 'bg-background text-muted-foreground hover:bg-card/50'
          }`}
        >
          Service Departments ({services.length})
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          className={`px-6 py-3 font-black text-sm uppercase border-t-2 border-x-2 border-border -mb-1 transition-all shrink-0 ${
            activeTab === 'terms' 
              ? 'bg-card text-foreground border-b-4 border-b-card translate-y-1 z-10' 
              : 'bg-background text-muted-foreground hover:bg-card/50'
          }`}
        >
          Payment Milestones ({paymentTerms.length})
        </button>
        <button 
          onClick={() => setActiveTab('risks')}
          className={`px-6 py-3 font-black text-sm uppercase border-t-2 border-x-2 border-border -mb-1 transition-all shrink-0 ${
            activeTab === 'risks' 
              ? 'bg-card text-foreground border-b-4 border-b-card translate-y-1 z-10' 
              : 'bg-background text-muted-foreground hover:bg-card/50'
          }`}
        >
          Risks & Notes
        </button>
      </div>

      {/* TAB CONTENT: Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {services.map((srv, idx) => {
            const isExpanded = isEditing || !!expandedServices[srv.service_id || idx];
            return (
              <div 
                key={srv.service_id || idx} 
                className="bg-card border-2 border-border shadow-brutal transition-all"
              >
                {/* Accordion Trigger */}
                <div 
                  onClick={() => !isEditing && toggleService(srv.service_id || idx)}
                  className={`p-5 flex items-center justify-between gap-4 font-bold ${!isEditing ? 'cursor-pointer hover:bg-muted/10' : ''}`}
                >
                  <div className="flex flex-wrap items-center gap-3 flex-grow">
                    <span className="bg-black text-white px-2.5 py-1 text-xs font-mono uppercase">
                      Dept {idx + 1}
                    </span>
                    {isEditing ? (
                      <div className="flex gap-2 flex-grow max-w-xl">
                        <input
                          type="text"
                          placeholder="Department Name"
                          value={srv.department_name || ''}
                          onChange={(e) => handleUpdateService(idx, 'department_name', e.target.value)}
                          className="bg-background border-2 border-border px-2 py-1 font-bold text-foreground text-sm focus:outline-none flex-grow"
                        />
                        <input
                          type="text"
                          placeholder="Service Category"
                          value={srv.role_title || ''}
                          onChange={(e) => handleUpdateService(idx, 'role_title', e.target.value)}
                          className="bg-background border-2 border-border px-2 py-1 font-bold text-foreground text-sm focus:outline-none flex-grow"
                        />
                      </div>
                    ) : (
                      <h3 className="text-xl font-extrabold text-foreground">
                        {srv.department_name} ({srv.role_title})
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Department Subtotal</p>
                      <p className="text-lg font-black text-primary">
                        ₹{(srv.subtotal || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    {!isEditing && (isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />)}
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="border-t-2 border-border p-6 bg-background/50 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Commercial variables */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-primary" /> Billing Breakdowns
                      </h4>
                      <div className="border-2 border-border bg-card p-4 space-y-3 font-mono text-sm shadow-brutal">
                        {isEditing ? (
                          <>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-muted-foreground text-xs">Staff Allocated:</span>
                              <input
                                type="number"
                                value={srv.quantity === undefined ? '' : srv.quantity}
                                onChange={(e) => handleUpdateService(idx, 'quantity', e.target.value)}
                                className="w-24 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-muted-foreground text-xs">Staff Grade:</span>
                              <input
                                type="text"
                                value={srv.manpower_type || ''}
                                onChange={(e) => handleUpdateService(idx, 'manpower_type', e.target.value)}
                                className="w-24 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-muted-foreground text-xs">Duration (Days):</span>
                              <input
                                type="number"
                                value={srv.duration_days === undefined ? '' : srv.duration_days}
                                onChange={(e) => handleUpdateService(idx, 'duration_days', e.target.value)}
                                className="w-24 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-muted-foreground text-xs">Shifts per Day:</span>
                              <input
                                type="number"
                                value={srv.shifts_per_day === undefined ? '' : srv.shifts_per_day}
                                onChange={(e) => handleUpdateService(idx, 'shifts_per_day', e.target.value)}
                                className="w-24 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex justify-between items-center gap-2 border-t border-border pt-2">
                              <span className="text-muted-foreground text-xs">Unit Rate (₹):</span>
                              <input
                                type="number"
                                value={srv.rate_per_day === undefined ? '' : srv.rate_per_day}
                                onChange={(e) => handleUpdateService(idx, 'rate_per_day', e.target.value)}
                                className="w-24 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Staff Allocated:</span>
                              <span className="font-bold text-foreground">{srv.quantity || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Staff Grade/Type:</span>
                              <span className="font-bold text-foreground">{srv.manpower_type || 'Standard'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-bold text-foreground">{srv.duration_days || 'N/A'} Days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shifts per Day:</span>
                              <span className="font-bold text-foreground">{srv.shifts_per_day || '1'} Shift</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                              <span className="text-muted-foreground">Unit Billing Rate:</span>
                              <span className="font-bold text-foreground">₹{(srv.rate_per_day || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between border-t-2 border-border pt-2 font-sans font-black text-base text-primary">
                          <span>Subtotal:</span>
                          <span>₹{(srv.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(srv.service_id || idx);
                              setIsWorkerModalOpen(true);
                            }}
                            className="mt-3 w-full inline-flex items-center justify-center text-center font-bold text-xs uppercase bg-[#2a14b4] text-white hover:bg-[#4338ca] px-4 py-2.5 border-2 border-border shadow-brutal transition-all cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 mr-2" /> Add / Manage Workers
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Scope of Work */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Operational Scope
                      </h4>
                      {isEditing ? (
                        <div>
                          <span className="text-[10px] text-muted-foreground block mb-1">Enter scope items (one per line):</span>
                          <textarea
                            rows="6"
                            value={(srv.service_scope || []).join('\n')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditData(prev => {
                                const copy = { ...prev };
                                const services = [...copy.line_items];
                                services[idx] = {
                                  ...services[idx],
                                  service_scope: val.split('\n').map(l => l.trim()).filter(l => l.length > 0)
                                };
                                copy.line_items = services;
                                return copy;
                              });
                            }}
                            className="w-full bg-background border-2 border-border p-2 font-mono text-xs text-foreground focus:outline-none"
                          />
                        </div>
                      ) : srv.service_scope?.length > 0 ? (
                        <ul className="space-y-2.5">
                          {srv.service_scope.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex gap-2.5 text-sm text-foreground">
                              <span className="bg-primary/20 text-primary border border-primary shrink-0 w-5 h-5 flex items-center justify-center font-bold text-xs mt-0.5">
                                {itemIdx + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No detailed scope extracted for this department.</p>
                      )}
                    </div>

                    {/* Right: Equipment and Duties */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-yellow-500" /> Equipment Included
                        </h4>
                        {isEditing ? (
                          <div>
                            <span className="text-[10px] text-muted-foreground block mb-1">Enter equipment list (comma separated):</span>
                            <input
                              type="text"
                              value={(srv.equipment_included || []).join(', ')}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditData(prev => {
                                  const copy = { ...prev };
                                  const services = [...copy.line_items];
                                  services[idx] = {
                                    ...services[idx],
                                    equipment_included: val.split(',').map(item => item.trim()).filter(item => item.length > 0)
                                  };
                                  copy.line_items = services;
                                  return copy;
                                  });
                              }}
                              className="w-full bg-background border-2 border-border px-2 py-1 font-bold text-foreground text-xs focus:outline-none"
                            />
                          </div>
                        ) : srv.equipment_included?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {srv.equipment_included.map((equip, eqIdx) => (
                              <span key={eqIdx} className="bg-card border-2 border-border text-xs px-2.5 py-1 font-semibold text-foreground shadow-brutal">
                                {equip}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Consumables/Equipment listed within scope.</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-extrabold text-sm uppercase text-muted-foreground tracking-wide block">Remarks</h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={srv.remarks || ''}
                            onChange={(e) => handleUpdateService(idx, 'remarks', e.target.value)}
                            className="w-full bg-background border-2 border-border px-2 py-1 font-bold text-foreground text-xs focus:outline-none"
                          />
                        ) : srv.remarks ? (
                          <div className="border-l-4 border-accent p-4 bg-accent/5">
                            <p className="text-sm text-foreground italic">"{srv.remarks}"</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No remarks.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: Payment Terms */}
      {activeTab === 'terms' && (
        <div className="bg-card border-2 border-border p-6 sm:p-8 shadow-brutal">
          <h3 className="text-2xl font-black mb-6 text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary animate-pulse" /> Commercial Payment Milestones
          </h3>

          {paymentTerms.length > 0 ? (
            <div className="relative border-l-4 border-border pl-6 ml-4 space-y-8 py-2">
              {paymentTerms.map((term, tIdx) => {
                const milestoneVal = qData.final_total_after_gst 
                  ? Math.round(qData.final_total_after_gst * (term.percentage / 100))
                  : 0;

                return (
                  <div key={tIdx} className="relative animate-fadeIn">
                    <div className="absolute -left-[36px] top-1 w-6 h-6 bg-card border-4 border-border flex items-center justify-center rounded-none font-bold text-xs">
                      {tIdx + 1}
                    </div>
                    
                    <div className="bg-background border-2 border-border p-4 shadow-brutal flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-grow">
                        {isEditing ? (
                          <input
                            type="text"
                            value={term.stage_name || ''}
                            onChange={(e) => handleUpdatePaymentTerm(tIdx, 'stage_name', e.target.value)}
                            className="bg-background border-2 border-border px-2 py-1 font-bold text-foreground text-sm focus:outline-none w-full max-w-md"
                            placeholder="Milestone Name"
                          />
                        ) : (
                          <>
                            <h4 className="text-lg font-extrabold text-foreground">{term.stage_name}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5">Determined directly from original proposal details</p>
                          </>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                            <input
                              type="number"
                              value={term.percentage === undefined ? '' : term.percentage}
                              onChange={(e) => handleUpdatePaymentTerm(tIdx, 'percentage', e.target.value)}
                              className="w-16 bg-background border-2 border-border px-2 py-0.5 text-right font-bold text-foreground text-xs focus:outline-none"
                              placeholder="%"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <span className="inline-block bg-primary text-primary-foreground font-black text-sm px-2.5 py-1 border-2 border-border uppercase">
                            {term.percentage}%
                          </span>
                        )}
                        {milestoneVal > 0 && (
                          <p className="text-lg font-black text-foreground font-mono">
                            ₹{milestoneVal.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Standard Net 30 payment timeline applicable. No explicit stages detected.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Risks and Notes */}
      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Block: Client Obligations & Notes */}
          <div className="space-y-6">
            <div className="bg-card border-2 border-border p-6 shadow-brutal">
              <h3 className="text-xl font-extrabold mb-4 text-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Client Obligations
              </h3>
              {isEditing ? (
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Enter obligations (one per line):</span>
                  <textarea
                    rows="6"
                    value={(qData.client_obligations || []).join('\n')}
                    onChange={(e) => handleUpdateList('client_obligations', e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              ) : qData.client_obligations?.length > 0 ? (
                <ul className="space-y-3">
                  {qData.client_obligations.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground">
                      <span className="text-primary font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No customized client obligations detected in standard quotations.</p>
              )}
            </div>

            <div className="bg-card border-2 border-border p-6 shadow-brutal">
              <h3 className="text-xl font-extrabold mb-4 text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> General Operational Notes
              </h3>
              {isEditing ? (
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Enter operational notes (one per line):</span>
                  <textarea
                    rows="6"
                    value={(qData.operational_notes || []).join('\n')}
                    onChange={(e) => handleUpdateList('operational_notes', e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              ) : qData.operational_notes?.length > 0 ? (
                <ul className="space-y-3">
                  {qData.operational_notes.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No general operational timelines listed.</p>
              )}
            </div>
          </div>

          {/* Right Block: Critical Risks */}
          <div className="space-y-6">
            <div className="bg-card border-2 border-border p-6 shadow-brutal">
              <h3 className="text-xl font-extrabold mb-4 text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent" /> Financial Risks & Penalties
              </h3>
              {isEditing ? (
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Enter financial risks (one per line):</span>
                  <textarea
                    rows="6"
                    value={(qData.financial_risks || []).join('\n')}
                    onChange={(e) => handleUpdateList('financial_risks', e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              ) : qData.financial_risks?.length > 0 ? (
                <div className="space-y-3">
                  {qData.financial_risks.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="border-2 border-border p-3 bg-red-500/5 text-sm text-foreground flex gap-3 items-start"
                    >
                      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No immediate commercial penalties or liabilities flagged.</p>
              )}
            </div>

            <div className="bg-card border-2 border-border p-6 shadow-brutal">
              <h3 className="text-xl font-extrabold mb-4 text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-500" /> Operational & Delivery Risks
              </h3>
              {isEditing ? (
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Enter operational risks (one per line):</span>
                  <textarea
                    rows="6"
                    value={(qData.operational_risks || []).join('\n')}
                    onChange={(e) => handleUpdateList('operational_risks', e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
              ) : qData.operational_risks?.length > 0 ? (
                <div className="space-y-3">
                  {qData.operational_risks.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="border-2 border-border p-3 bg-yellow-500/5 text-sm text-foreground flex gap-3 items-start"
                    >
                      <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No immediate operations or transport risks flagged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Overlay Modal popup */}
      <AddWorkerModal 
        serviceId={selectedServiceId} 
        service={services.find((s, idx) => {
          const srvId = s.service_id || idx;
          return String(srvId) === String(selectedServiceId);
        })}
        isOpen={isWorkerModalOpen} 
        onClose={() => setIsWorkerModalOpen(false)} 
      />
    </div>
  );
}
