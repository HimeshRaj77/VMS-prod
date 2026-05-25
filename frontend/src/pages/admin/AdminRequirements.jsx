import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Loader2, CheckCircle2, AlertCircle, ClipboardList,
  ChevronDown, RefreshCw, Plus, Minus
} from 'lucide-react';
import adminApi from '../../api/adminApi';

const DEPARTMENTS = [
  { key: 'MAWAID',         label: 'Mawaid',          color: '#9A3412' },
  { key: 'AVIT',           label: 'AVIT',             color: '#581C87' },
  { key: 'SEHAT',          label: 'Sehat',            color: '#064E3B' },
  { key: 'FIRE SAFETY',    label: 'Fire Safety',      color: '#991B1B' },
  { key: 'FLOW MANAGEMENT',label: 'Flow Management',  color: '#1E40AF' },
  { key: 'KARAMAT',        label: 'Karamat',          color: '#701A75' },
  { key: 'SABEEL',         label: 'Sabeel',           color: '#0E7490' },
  { key: 'TRANSPORT',      label: 'Transport',        color: '#3730A3' },
  { key: 'SECURITY',       label: 'Security',         color: '#111827' },
  { key: 'NAZAFAT',        label: 'Nazafat',          color: '#BE185D' },
  { key: 'TAZYEEN',        label: 'Tazyeen',          color: '#4D7C0F' },
];

const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 5, 13 + i); // June 13–26 2026
  return {
    value: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`,
    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
});

const ZONES = Array.from({ length: 17 }, (_, i) => `Zone ${i + 1}`);

const DEFAULT_SLOTS = Object.fromEntries(DEPARTMENTS.map(d => [d.key, 5]));

export default function AdminRequirements() {
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [slots, setSlots] = useState({ ...DEFAULT_SLOTS });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [existingData, setExistingData] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/admin/requirements?date=${selectedDate}&zone=${encodeURIComponent(selectedZone)}`);
      const data = res.data || [];
      setExistingData(data);
      // Populate slots from DB, fill missing departments with 0
      const populated = { ...DEFAULT_SLOTS };
      data.forEach(r => {
        if (populated.hasOwnProperty(r.department)) {
          populated[r.department] = r.slots;
        }
      });
      setSlots(populated);
    } catch {
      setSlots({ ...DEFAULT_SLOTS });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedZone]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const handleSlotChange = (dept, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    setSlots(prev => ({ ...prev, [dept]: num }));
  };

  const increment = (dept) => setSlots(prev => ({ ...prev, [dept]: (prev[dept] || 0) + 1 }));
  const decrement = (dept) => setSlots(prev => ({ ...prev, [dept]: Math.max(0, (prev[dept] || 0) - 1) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const departments = DEPARTMENTS.map(d => ({ department: d.key, slots: slots[d.key] || 0 }));
      await adminApi.post('/admin/requirements', { date: selectedDate, zone: selectedZone, departments });
      showToast(`Requirements for ${selectedZone} on ${selectedDate} saved successfully!`);
      fetchRequirements();
    } catch (err) {
      showToast('Failed to save requirements. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = Object.values(slots).reduce((s, v) => s + (v || 0), 0);
  const isExisting = existingData.length > 0;

  return (
    <div className="space-y-8 pb-12 font-sans text-foreground antialiased">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3 border-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-xs uppercase tracking-wider
              ${toast.type === 'error' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-primary text-primary-foreground border-primary'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b-2 border-border pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-border shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <ClipboardList className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">Requirements Manager</h1>
        </div>
        <p className="text-xs text-muted-foreground font-medium ml-11">
          Define slot counts per service for each date and zone. These drive the allocation matrix.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-5 border-2 border-border shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Date */}
          <div className="flex flex-col space-y-1.5 min-w-[180px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deployment Date</label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-background border-2 border-border pl-3 pr-8 py-2.5 text-xs font-bold text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors"
              >
                {DATES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Zone */}
          <div className="flex flex-col space-y-1.5 min-w-[160px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deployment Zone</label>
            <div className="relative">
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="w-full bg-background border-2 border-border pl-3 pr-8 py-2.5 text-xs font-bold text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors"
              >
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Status badge */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
            <span className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider border-2 ${isExisting ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
              {isExisting ? '● Existing Record' : '◌ New Entry'}
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchRequirements}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-border bg-card text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Slots</p>
              <p className="text-2xl font-black text-primary leading-none">{totalSlots}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 btn-primary text-xs font-black uppercase tracking-wider border-2 border-primary shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isExisting ? 'Update Requirements' : 'Save Requirements'}
            </button>
          </div>
        </div>
      </div>

      {/* Department Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 border-2 border-border bg-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Loading requirements...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEPARTMENTS.map((dept) => {
            const val = slots[dept.key] || 0;
            return (
              <motion.div
                key={dept.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-2 border-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden"
              >
                {/* Dept colour strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: dept.color }}
                />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 flex items-center justify-center text-white text-[9px] font-black border border-white/20"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.key.slice(0, 2)}
                    </div>
                    <p className="font-black text-xs uppercase tracking-tight text-foreground">{dept.label}</p>
                  </div>

                  {/* Slot counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrement(dept.key)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={e => handleSlotChange(dept.key, e.target.value)}
                      className="flex-1 text-center py-1.5 border-2 border-border bg-background text-foreground font-black text-sm focus:outline-none focus:border-primary transition-colors"
                    />

                    <button
                      onClick={() => increment(dept.key)}
                      className="w-8 h-8 flex items-center justify-center border-2 border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                    {val === 0 ? 'No slots assigned' : `${val} slot${val !== 1 ? 's' : ''} required`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
