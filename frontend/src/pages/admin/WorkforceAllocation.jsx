import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Trash2, Layers, Truck, HeartPulse, Utensils, Flame, Tv, 
  Droplets, Sparkles, Palette, AlertTriangle, Info, X, Search, 
  ChevronDown, ChevronUp, Users, Grid, Loader2, Save, Filter, CheckCircle2
} from 'lucide-react';
import adminApi from '../../api/adminApi';

// High-fidelity service specifications with differentiable DEEP DARK shades of colors
const DEPARTMENTS = {
  MAWAID: {
    name: 'MAWAID',
    label: 'Catering & Food',
    color: '#9A3412', // Refined Deep Rust Orange/Brown
    bgColor: 'bg-[#9A3412]/10',
    textColor: 'text-[#9A3412]',
    borderColor: 'border-[#9A3412]',
    lightBorderColor: 'border-[#9A3412]/30',
    prefix: 'MW',
    icon: Utensils,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Head Cook' },
      { name: 'Kitchen Cleaners' },
      { name: 'Utensil Cleaners' },
      { name: 'Helpers' },
      { name: 'Labourer' },
      { name: 'Waste Collectors' }
    ]
  },
  AVIT: {
    name: 'AVIT',
    label: 'AV Technical',
    color: '#581C87', // Refined Deep Plum Purple
    bgColor: 'bg-[#581C87]/10',
    textColor: 'text-[#581C87]',
    borderColor: 'border-[#581C87]',
    lightBorderColor: 'border-[#581C87]/30',
    prefix: 'AV',
    icon: Tv,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'AV Technician' },
      { name: 'Helpers' },
      { name: 'Labours' }
    ]
  },
  SEHAT: {
    name: 'SEHAT',
    label: 'Medical & Aid',
    color: '#064E3B', // Refined Deep Forest Green
    bgColor: 'bg-[#064E3B]/10',
    textColor: 'text-[#064E3B]',
    borderColor: 'border-[#064E3B]',
    lightBorderColor: 'border-[#064E3B]/30',
    prefix: 'SH',
    icon: HeartPulse,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Expert Doctors' },
      { name: 'Nurses' },
      { name: 'Helpers' },
      { name: 'Labours (for Setup)' }
    ]
  },
  'FIRE SAFETY': {
    name: 'FIRE SAFETY',
    label: 'Fire Safety',
    color: '#991B1B', // Refined Deep Crimson Red
    bgColor: 'bg-[#991B1B]/10',
    textColor: 'text-[#991B1B]',
    borderColor: 'border-[#991B1B]',
    lightBorderColor: 'border-[#991B1B]/30',
    prefix: 'FS',
    icon: Flame,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Fire Safety Experts' },
      { name: 'Outside Agency: Police' }
    ]
  },
  'FLOW MANAGEMENT': {
    name: 'FLOW MANAGEMENT',
    label: 'Crowd Flow',
    color: '#1E40AF', // Refined Deep Royal Blue
    bgColor: 'bg-[#1E40AF]/10',
    textColor: 'text-[#1E40AF]',
    borderColor: 'border-[#1E40AF]',
    lightBorderColor: 'border-[#1E40AF]/30',
    prefix: 'FM',
    icon: Layers,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Security' },
      { name: 'Bouncers' },
      { name: 'Helpers' },
      { name: 'Outside Agency: Police' }
    ]
  },
  KARAMAT: {
    name: 'KARAMAT',
    label: 'VIP Protocol',
    color: '#701A75', // Refined Deep Wine Maroon
    bgColor: 'bg-[#701A75]/10',
    textColor: 'text-[#701A75]',
    borderColor: 'border-[#701A75]',
    lightBorderColor: 'border-[#701A75]/30',
    prefix: 'KR',
    icon: Sparkles,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Nurses' },
      { name: 'Helpers' }
    ]
  },
  SABEEL: {
    name: 'SABEEL',
    label: 'Water Supply',
    color: '#0E7490', // Refined Deep Aqua Teal
    bgColor: 'bg-[#0E7490]/10',
    textColor: 'text-[#0E7490]',
    borderColor: 'border-[#0E7490]',
    lightBorderColor: 'border-[#0E7490]/30',
    prefix: 'SB',
    icon: Droplets,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Helpers' },
      { name: 'Labors' }
    ]
  },
  TRANSPORT: {
    name: 'TRANSPORT',
    label: 'Fleet Services',
    color: '#3730A3', // Refined Deep Royal Indigo
    bgColor: 'bg-[#3730A3]/10',
    textColor: 'text-[#3730A3]',
    borderColor: 'border-[#3730A3]',
    lightBorderColor: 'border-[#3730A3]/30',
    prefix: 'TR',
    icon: Truck,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Drivers' },
      { name: 'Marshalls' },
      { name: 'Logistic Co-ordinator' }
    ]
  },
  SECURITY: {
    name: 'SECURITY',
    label: 'Guarding & Patrol',
    color: '#111827', // Refined Deep Midnight Black
    bgColor: 'bg-[#111827]/10',
    textColor: 'text-[#111827]',
    borderColor: 'border-[#111827]',
    lightBorderColor: 'border-[#111827]/30',
    prefix: 'SC',
    icon: Shield,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Security Guards' },
      { name: 'Bouncers' },
      { name: 'Outside Agency: Police' }
    ]
  },
  NAZAFAT: {
    name: 'NAZAFAT',
    label: 'Housekeeping',
    color: '#BE185D', // Refined Deep Rose Fuchsia
    bgColor: 'bg-[#BE185D]/10',
    textColor: 'text-[#BE185D]',
    borderColor: 'border-[#BE185D]',
    lightBorderColor: 'border-[#BE185D]/30',
    prefix: 'NZ',
    icon: Trash2,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Helpers' },
      { name: 'Waste Collectors' },
      { name: 'House Keeping Staff' }
    ]
  },
  TAZYEEN: {
    name: 'TAZYEEN',
    label: 'Branding & Decor',
    color: '#4D7C0F', // Refined Deep Lime Olive Green
    bgColor: 'bg-[#4D7C0F]/10',
    textColor: 'text-[#4D7C0F]',
    borderColor: 'border-[#4D7C0F]',
    lightBorderColor: 'border-[#4D7C0F]/30',
    prefix: 'TZ',
    icon: Palette,
    roles: [
      { name: 'Mumineen KG' },
      { name: 'Helpers' },
      { name: 'Labors' }
    ]
  }
};

const DATES = [
  { value: '13/06/2026', label: '13 Jun', day: 'Thu' },
  { value: '14/06/2026', label: '14 Jun', day: 'Fri' },
  { value: '15/06/2026', label: '15 Jun', day: 'Sat' },
  { value: '16/06/2026', label: '16 Jun', day: 'Sun' },
  { value: '17/06/2026', label: '17 Jun', day: 'Mon' },
  { value: '18/06/2026', label: '18 Jun', day: 'Tue' },
  { value: '19/06/2026', label: '19 Jun', day: 'Wed' },
  { value: '20/06/2026', label: '20 Jun', day: 'Thu' },
  { value: '21/06/2026', label: '21 Jun', day: 'Fri' },
  { value: '22/06/2026', label: '22 Jun', day: 'Sat' },
  { value: '23/06/2026', label: '23 Jun', day: 'Sun' },
  { value: '24/06/2026', label: '24 Jun', day: 'Mon' },
  { value: '25/06/2026', label: '25 Jun', day: 'Tue' },
  { value: '26/06/2026', label: '26 Jun', day: 'Wed' }
];

const ZONES = Array.from({ length: 17 }, (_, i) => ({
  id: `Zone ${i + 1}`,
  name: `Zone ${i + 1}`,
  description: `Zone ${i + 1} Area`
}));

// Default 5 slots per service — admin can override via Requirements Manager
const DEFAULT_SECTORS = {
  MAWAID: { slots: 5 },
  AVIT: { slots: 5 },
  SEHAT: { slots: 5 },
  'FIRE SAFETY': { slots: 5 },
  'FLOW MANAGEMENT': { slots: 5 },
  KARAMAT: { slots: 5 },
  SABEEL: { slots: 5 },
  TRANSPORT: { slots: 5 },
  SECURITY: { slots: 5 },
  NAZAFAT: { slots: 5 },
  TAZYEEN: { slots: 5 }
};

const ZONE_SECTORS = Object.fromEntries(
  ZONES.map(z => [z.id, { ...DEFAULT_SECTORS }])
);

export default function WorkforceAllocation() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('13/06/2026');
  const [selectedZone, setSelectedZone] = useState('Zone 1');
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [reqFilterDept, setReqFilterDept] = useState('ALL');
  const [rosterSearchQuery, setRosterSearchQuery] = useState('');
  const [isAutoAllocateActive, setIsAutoAllocateActive] = useState(false);
  const [rosterFilterGender, setRosterFilterGender] = useState('ALL');
  const [rosterFilterStatus, setRosterFilterStatus] = useState('ALL');
  const [rosterFilterAgency, setRosterFilterAgency] = useState('ALL');

  // Core Data States
  const [allAllocations, setAllAllocations] = useState({}); // { [date_zone]: { [slotKey]: worker } }
  const [allocations, setAllocations] = useState({}); // Active mapping for current date_zone
  const [workers, setWorkers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Interactive Selection States
  const [inspectedSlot, setInspectedSlot] = useState(null);
  
  // UI states
  const [expandedService, setExpandedService] = useState('MAWAID');
  const [draggedWorker, setDraggedWorker] = useState(null);
  const [dragOverSlotKey, setDragOverSlotKey] = useState(null);
  const [conflictSlotKey, setConflictSlotKey] = useState(null);
  const [saveToast, setSaveToast] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null); // { worker, x, y }

  const handleSlotMouseEnter = (e, worker) => {
    if (!worker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredSlot({
      worker,
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleSlotMouseLeave = () => setHoveredSlot(null);


  // Sync URL search parameters reactively when parameters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const z = params.get('zone');
    const d = params.get('date');
    if (z && d) {
      if (ZONES.find(zone => zone.id === z) && DATES.find(date => date.value === d)) {
        setSelectedZone(z);
        setSelectedDate(d);
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('zone', selectedZone);
    params.set('date', selectedDate);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [selectedZone, selectedDate]);

  // Fetch requirements from DB for the selected date + zone
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await adminApi.get(`/admin/requirements?date=${selectedDate}&zone=${encodeURIComponent(selectedZone)}`);
        const dbReqs = res.data || [];

        let generatedReqs = [];

        if (dbReqs.length > 0) {
          // Build from DB requirements
          dbReqs.forEach(({ department: deptKey, slots: slotsCount }) => {
            const dept = DEPARTMENTS[deptKey];
            if (!dept || slotsCount <= 0) return;
            const roles = dept.roles;
            for (let i = 0; i < slotsCount; i++) {
              const role = roles[i % roles.length];
              generatedReqs.push({
                id: `${deptKey}_${role.name.replace(/\s+/g, '_')}_${i}`,
                dept: deptKey,
                roleName: role.name,
                slotIndex: i + 1
              });
            }
          });
        } else {
          // Fallback: use DEFAULT_SECTORS so something shows
          const fallback = ZONE_SECTORS[selectedZone] || ZONE_SECTORS['Zone 1'];
          Object.keys(fallback).forEach((deptKey) => {
            const sectorConfig = fallback[deptKey];
            const dept = DEPARTMENTS[deptKey];
            if (!dept) return;
            const roles = dept.roles;
            for (let i = 0; i < sectorConfig.slots; i++) {
              const role = roles[i % roles.length];
              generatedReqs.push({
                id: `${deptKey}_${role.name.replace(/\s+/g, '_')}_${i}`,
                dept: deptKey,
                roleName: role.name,
                slotIndex: i + 1
              });
            }
          });
        }

        setRequirements(generatedReqs);
        setInspectedSlot(null);
      } catch {
        // On network error fall back silently
        setRequirements([]);
      }
    };

    fetchRequirements();
  }, [selectedZone, selectedDate]);

  // Load backend data: workers, quotations & allocations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all workers and quotations in parallel
        const [quoteRes, workersRes] = await Promise.all([
          adminApi.get('/admin/quotations'),
          adminApi.get('/admin/workers').catch(err => {
            console.warn('Backend workers endpoint error, using backup:', err);
            return { data: [] };
          })
        ]);

        const dbQuotes = quoteRes.data || [];
        const activeQuotes = dbQuotes.filter(q => q.extractionStatus === 'success' && q.structuredQuotation);
        const dbWorkers = workersRes.data || [];

        let compiledWorkers = [];

        if (dbWorkers.length > 0) {
          // If we have workers in the Postgres database, load them directly!
          compiledWorkers = dbWorkers;
        } else {
          // Compile available worker pool from active quotations
          const NAMES_MALE = ['Husain Najmi', 'Ali Asger', 'Mustafa Raja', 'Taha Kothari', 'Mufaddal Bhai', 'Shabbir Hakim', 'Burhanuddin Sodawala', 'Khozema Shakar'];
          const NAMES_FEMALE = ['Sakina Bai', 'Fatema Kapadia', 'Arwa Merchant', 'Zainab Patanwala', 'Rashida Contractor', 'Nafisa Bandukwala', 'Amatullah Merchant', 'Ummehani Lokhandwala'];

          if (activeQuotes.length > 0) {
            activeQuotes.forEach((q, idx) => {
              const sq = q.structuredQuotation;
              const services = sq.structuredData?.line_items || sq.structuredData?.services || [];
              const vendorName = sq.vendorCompany || q.agency?.agencyName || `Agency ${idx + 1}`;

              services.forEach((service, sIdx) => {
                let deptName = (service.department_name || 'SECURITY').toUpperCase().trim();
                
                // Map to standard 11 services
                if (!DEPARTMENTS[deptName]) {
                  const matched = Object.keys(DEPARTMENTS).find(k => 
                    deptName.includes(k) || k.includes(deptName)
                  );
                  deptName = matched || 'MAWAID';
                }

                const count = service.quantity || service.manpower_count || 5;
                const rate = service.rate_per_day || service.rate_per_manpower || 350;

                for (let i = 1; i <= count; i++) {
                  const isMale = (idx + sIdx + i) % 2 === 0;
                  const nameList = isMale ? NAMES_MALE : NAMES_FEMALE;
                  const name = nameList[(idx * 3 + sIdx * 2 + i) % nameList.length];
                  
                  compiledWorkers.push({
                    id: `dbw-${q.id}-${deptName}-${sIdx}-${i}`,
                    name,
                    gender: isMale ? 'Male' : 'Female',
                    dept: deptName,
                    agency: vendorName,
                    ratePerDay: rate,
                    role: service.role_title || service.service_name || `${deptName} Marshal`
                  });
                }
              });
            });
          }

          // Fallback static pool if quotations yield no workers either
          if (compiledWorkers.length === 0) {
            Object.keys(DEPARTMENTS).forEach((deptKey, dIdx) => {
              const dept = DEPARTMENTS[deptKey];
              dept.roles.forEach((role, rIdx) => {
                for (let i = 1; i <= 4; i++) {
                  const isMale = (dIdx + rIdx + i) % 2 === 0;
                  const nameList = isMale ? NAMES_MALE : NAMES_FEMALE;
                  const name = nameList[(dIdx * 3 + rIdx * 2 + i) % nameList.length];
                  
                  compiledWorkers.push({
                    id: `mock-${deptKey}-${rIdx}-${i}`,
                    name,
                    gender: isMale ? 'Male' : 'Female',
                    dept: deptKey,
                    agency: dIdx % 2 === 0 ? 'Azure Logistics' : 'Rose Guardians',
                    ratePerDay: 250 + (rIdx * 50) + (i * 20),
                    role: role.name
                  });
                }
              });
            });
          }
        }

        setWorkers(compiledWorkers);

        // Fetch global allocations map
        const allocRes = await adminApi.get('/admin/allocations');
        const dbAllocations = allocRes.data || {};
        setAllAllocations(dbAllocations);

        // Set active date_zone map
        const key = `${selectedDate}_${selectedZone}`;
        setAllocations(dbAllocations[key] || {});
      } catch (err) {
        console.error('Error fetching database, loading backup:', err);
        setupMockPool();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update active allocation when date or zone changes
  useEffect(() => {
    const key = `${selectedDate}_${selectedZone}`;
    setAllocations(allAllocations[key] || {});
    setInspectedSlot(null);
    setIsAutoAllocateActive(false);
    setRosterFilterGender('ALL');
    setRosterFilterStatus('ALL');
    setRosterFilterAgency('ALL');
  }, [selectedDate, selectedZone, allAllocations]);

  const setupMockPool = () => {
    const NAMES_MALE = ['Husain Najmi', 'Ali Asger', 'Mustafa Raja', 'Taha Kothari', 'Mufaddal Bhai', 'Shabbir Hakim', 'Burhanuddin Sodawala', 'Khozema Shakar'];
    const NAMES_FEMALE = ['Sakina Bai', 'Fatema Kapadia', 'Arwa Merchant', 'Zainab Patanwala', 'Rashida Contractor', 'Nafisa Bandukwala', 'Amatullah Merchant', 'Ummehani Lokhandwala'];
    
    const mockWorkers = [];
    Object.keys(DEPARTMENTS).forEach((deptKey, dIdx) => {
      const dept = DEPARTMENTS[deptKey];
      dept.roles.forEach((role, rIdx) => {
        for (let i = 1; i <= 4; i++) {
          const isMale = (dIdx + rIdx + i) % 2 === 0;
          const nameList = isMale ? NAMES_MALE : NAMES_FEMALE;
          const name = nameList[(dIdx * 3 + rIdx * 2 + i) % nameList.length];
          
          mockWorkers.push({
            id: `mock-${deptKey}-${rIdx}-${i}`,
            name,
            gender: isMale ? 'Male' : 'Female',
            dept: deptKey,
            agency: dIdx % 2 === 0 ? 'Azure Logistics' : 'Rose Guardians',
            ratePerDay: 200 + (rIdx * 60) + (i * 20),
            role: role.name
          });
        }
      });
    });
    setWorkers(mockWorkers);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, worker) => {
    setDraggedWorker(worker);
    e.dataTransfer.setData('text/plain', worker.id);
  };

  const handleDragEnd = () => {
    setDraggedWorker(null);
    setDragOverSlotKey(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, slotKey) => {
    e.preventDefault();
    setDragOverSlotKey(slotKey);
  };

  const handleDrop = (e, targetDept, targetSlotKey, targetRole) => {
    e.preventDefault();
    setDragOverSlotKey(null);

    if (!draggedWorker) return;

    // VALIDATION: Service type match with robust normalization
    const workerDept = (draggedWorker.dept || '').toUpperCase().trim();
    const slotDept = (targetDept || '').toUpperCase().trim();
    const deptConfig = DEPARTMENTS[slotDept];
    const slotLabel = deptConfig?.label?.toUpperCase().trim() || '';

    const isMatch = workerDept === slotDept || 
                    workerDept.includes(slotDept) || 
                    slotDept.includes(workerDept) ||
                    (slotLabel && (workerDept === slotLabel || workerDept.includes(slotLabel) || slotLabel.includes(workerDept)));

    if (!isMatch) {
      setConflictSlotKey(targetSlotKey);
      setTimeout(() => setConflictSlotKey(null), 1000);
      return;
    }

    // Check if worker is already allocated anywhere on this date/zone
    const activeSlotKey = Object.keys(allocations).find(k => allocations[k]?.id === draggedWorker.id);
    if (activeSlotKey) return;

    setAllocations(prev => ({
      ...prev,
      [targetSlotKey]: draggedWorker
    }));
  };

  const handleDeallocate = (slotKey) => {
    const worker = allocations[slotKey];
    if (!worker) return;

    setAllocations(prev => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });

    if (inspectedSlot && inspectedSlot.id === slotKey) {
      setInspectedSlot(null);
    }
  };

  const handleClearAll = () => {
    setAllocations({});
    setInspectedSlot(null);
    setIsAutoAllocateActive(false);
  };

  const handleAutoAllocateToggle = (checked) => {
    setIsAutoAllocateActive(checked);
    if (!checked) return;

    // Start auto allocation
    const newAllocations = { ...allocations };
    
    // Track assigned worker IDs across the entire date/zone allocations to avoid duplicate assignments
    const assignedIds = new Set(Object.values(newAllocations).map(w => w.id));

    let allocationCount = 0;

    // For each requirement (slot)
    requirements.forEach(req => {
      // Check if this slot already has a worker assigned
      if (newAllocations[req.id]) return;

      // Find available workers for this slot's department
      const deptKey = req.dept;
      const deptConfig = DEPARTMENTS[deptKey];
      const targetDept = deptKey.toUpperCase().trim();
      const targetLabel = deptConfig?.label?.toUpperCase().trim() || '';

      const availableWorkersForDept = workers.filter(w => {
        const deptValue = w.dept || w.department;
        if (!deptValue) return false;
        const workerDept = deptValue.toUpperCase().trim();
        
        const matchesDept = workerDept === targetDept || 
               workerDept.includes(targetDept) || 
               targetDept.includes(workerDept) ||
               (targetLabel && (workerDept === targetLabel || workerDept.includes(targetLabel) || targetLabel.includes(workerDept)));
               
        return matchesDept && !assignedIds.has(w.id);
      });

      // Sort by cost ascending (cheapest first)
      availableWorkersForDept.sort((a, b) => (a.ratePerDay || 0) - (b.ratePerDay || 0));

      if (availableWorkersForDept.length > 0) {
        const cheapestWorker = availableWorkersForDept[0];
        newAllocations[req.id] = cheapestWorker;
        assignedIds.add(cheapestWorker.id);
        allocationCount++;
      }
    });

    if (allocationCount > 0) {
      setAllocations(newAllocations);
      setSaveToast({
        message: `Auto-allocated ${allocationCount} worker(s) successfully! Click 'Save Changes' to commit to database.`,
        type: 'success'
      });
      setTimeout(() => setSaveToast(null), 4000);
    } else {
      setSaveToast({
        message: 'No available unassigned workers found for empty slots.',
        type: 'error'
      });
      setTimeout(() => setSaveToast(null), 3000);
      setIsAutoAllocateActive(false);
    }
  };

  // POST allocations to the database
  const handleSaveAllocations = async () => {
    setSaving(true);
    const key = `${selectedDate}_${selectedZone}`;
    const payload = {
      ...allAllocations,
      [key]: allocations
    };

    try {
      await adminApi.post('/admin/allocations', { allocations: payload });
      setAllAllocations(payload);
      
      setSaveToast({
        message: 'Deployment written to database successfully!',
        type: 'success'
      });
      setTimeout(() => {
        setSaveToast(null);
      }, 1500);
    } catch (err) {
      console.error('Error saving allocations:', err);
      setSaveToast({
        message: 'Failed to write allocations. Check network.',
        type: 'error'
      });
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Requirements Filtering & Searching
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = searchQuery === '' || 
      req.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.dept.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = reqFilterDept === 'ALL' || req.dept === reqFilterDept;
    
    return matchesSearch && matchesDept;
  });

  const uniqueAgencies = ['ALL', ...new Set(workers.map(w => w.agency).filter(Boolean))];

  // Roster Pool Filtering
  const filteredRosterWorkers = (deptKey) => {
    const deptConfig = DEPARTMENTS[deptKey];
    const targetDept = deptKey.toUpperCase().trim();
    const targetLabel = deptConfig?.label?.toUpperCase().trim() || '';

    return workers.filter(w => {
      const deptValue = w.dept || w.department;
      if (!deptValue) return false;
      const workerDept = deptValue.toUpperCase().trim();
      
      const matchesDept = workerDept === targetDept || 
             workerDept.includes(targetDept) || 
             targetDept.includes(workerDept) ||
             (targetLabel && (workerDept === targetLabel || workerDept.includes(targetLabel) || targetLabel.includes(workerDept)));

      // 1. Gender category filter
      const matchesGender = rosterFilterGender === 'ALL' || (w.gender && w.gender.toUpperCase() === rosterFilterGender.toUpperCase());
      
      // 2. Status category filter
      const activeSlotKey = Object.keys(allocations).find(k => allocations[k]?.id === w.id);
      const isAllocated = !!activeSlotKey;
      const matchesStatus = rosterFilterStatus === 'ALL' || 
                            (rosterFilterStatus === 'AVAILABLE' && !isAllocated) || 
                            (rosterFilterStatus === 'DEPLOYED' && isAllocated);

      // 3. Agency category filter
      const matchesAgency = rosterFilterAgency === 'ALL' || w.agency === rosterFilterAgency;

      return matchesDept && matchesGender && matchesStatus && matchesAgency;
    }).filter(w => 
      rosterSearchQuery === '' || 
      w.role.toLowerCase().includes(rosterSearchQuery.toLowerCase()) ||
      (w.dept || w.department || '').toLowerCase().includes(rosterSearchQuery.toLowerCase())
    ).sort((a, b) => {
      const aAlloc = Object.values(allocations).some(all => all.id === a.id);
      const bAlloc = Object.values(allocations).some(all => all.id === b.id);
      if (aAlloc && !bAlloc) return 1;
      if (!aAlloc && bAlloc) return -1;
      return 0;
    });
  };

  // Dynamic Metrics
  const totalAllocated = Object.keys(allocations).length;
  const totalDailyCost = Object.values(allocations).reduce((sum, w) => sum + (w.ratePerDay || 0), 0);
  const coveragePercentage = requirements.length > 0 ? Math.round((totalAllocated / requirements.length) * 100) : 0;

  const currentKey = `${selectedDate}_${selectedZone}`;
  const dbAllocForToday = allAllocations[currentKey] || {};
  const hasUnsavedChanges = JSON.stringify(allocations) !== JSON.stringify(dbAllocForToday);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-sans p-6 text-foreground animate-none bg-background">
        <div className="card p-8 max-w-sm text-center shadow space-y-4 rounded-none">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Synchronizing Workspace</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Extracting registered agency rosters, aligning physical contract requirements, and rendering interactive requirement vectors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12 bg-background text-foreground antialiased">
      {/* Fixed-position worker tooltip — escapes all overflow clipping */}
      {hoveredSlot && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{
            left: hoveredSlot.x,
            top: hoveredSlot.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-card text-foreground border-2 border-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-3 w-48 rounded-none">
            <p className="font-black text-xs uppercase tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{hoveredSlot.worker.name}</p>
            <div className="w-full h-0.5 bg-border my-1.5" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{hoveredSlot.worker.role}</p>
            <p className="text-[10px] font-black mt-1">DEPT: <span className="text-primary">{hoveredSlot.worker.dept}</span></p>
            <p className="text-[10px] font-black mt-0.5">RATE: <span className="text-primary">₹{hoveredSlot.worker.ratePerDay}/day</span></p>
          </div>
          {/* Arrow pointing down */}
          <div className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
      {/* Toast notifications */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center px-6 py-4 border-2 shadow-md w-11/12 max-w-md ${
              saveToast.type === 'success' ? 'bg-card text-foreground border-border' : 'bg-destructive text-destructive-foreground border-border'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 ${saveToast.type === 'success' ? 'text-emerald-600' : 'text-destructive-foreground'}`} />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider leading-none">
                {saveToast.type === 'success' ? 'Database Written' : 'Save Failed'}
              </p>
              <p className="font-medium text-xs mt-1 leading-tight">{saveToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header controls section */}
      <div className="bg-card border-2 border-border p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Workforce Allocation Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Drag and drop registered vendor personnel directly into dynamic requirement slots below.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 uppercase">
              Total Allocated: {totalAllocated} / {requirements.length}
            </span>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-2 py-0.5 uppercase">
              Overall Daily Cost: ₹{totalDailyCost.toLocaleString()}
            </span>
            <span className="text-[9px] font-mono font-bold bg-foreground/10 text-foreground border border-border px-2 py-0.5 uppercase">
              Coverage: {coveragePercentage}%
            </span>
            {hasUnsavedChanges && (
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/25 px-2 py-0.5 uppercase animate-pulse">
                ● Unsaved Deployment
              </span>
            )}
          </div>
        </div>

        {/* Global Controls: Date, Zone, and Actions */}
        <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
          {/* Zone Selector */}
          <div className="flex flex-col space-y-1.5 w-full sm:w-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deployment Zone</span>
            <div className="relative">
              <select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-background border-2 border-border pl-3 pr-8 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer h-[38px]"
              >
                {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex flex-col space-y-1.5 w-full sm:w-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deployment Date</span>
            <div className="relative">
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-background border-2 border-border pl-3 pr-8 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer h-[38px]"
              >
                {DATES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Actions & Cost */}
          <div className="flex flex-wrap items-end gap-3 pt-2 sm:pt-0">
            <div className="flex flex-col items-start mr-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">{selectedZone} Cost</span>
              <span className="text-lg font-black text-primary leading-none mt-1.5">₹{totalDailyCost.toLocaleString()}</span>
            </div>
            
            {/* Auto Fill Checkbox Toggle */}
            <label className="flex items-center gap-2 cursor-pointer border-2 border-border bg-card px-3 h-[38px] text-xs font-bold uppercase shadow select-none hover:bg-muted active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0">
              <input
                type="checkbox"
                checked={isAutoAllocateActive}
                onChange={(e) => handleAutoAllocateToggle(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-border cursor-pointer accent-primary"
              />
              <span className="text-foreground tracking-wide font-black">Auto Fill</span>
            </label>

            <button 
              onClick={handleClearAll}
              className="text-xs uppercase px-4 h-[38px] flex items-center justify-center bg-card hover:bg-muted text-foreground font-bold border-2 border-border shadow active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              Clear All
            </button>
            <button 
              onClick={handleSaveAllocations}
              disabled={saving}
              className="text-xs uppercase px-5 h-[38px] flex items-center justify-center gap-2 btn-primary font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 animate-none" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Framework Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Section: Consolidated Requirements Matrix Ledger (Takes 2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6 space-y-6">
            
            {/* Filter and Search Bar for Requirements Grid */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b-2 border-border pb-6">
              <div>
                <h2 className="text-sm font-bold uppercase text-foreground flex items-center gap-2">
                  <Grid className="w-4 h-4 text-primary" /> Requirements Deployment Grid
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Drag available personnel from the right pool directly into matching colored slots. Click a box to inspect.
                </p>
              </div>

              {/* Filtering Controls with sleek dropdown styling */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    value={reqFilterDept}
                    onChange={(e) => setReqFilterDept(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    {Object.keys(DEPARTMENTS).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Theatre Seats Arrangement Grid */}
            {filteredRequirements.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-border text-center rounded-none bg-muted">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-mono text-xs text-muted-foreground uppercase font-bold">
                  No slots match the selected search query.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-stretch space-y-6">
                
                {/* Requirements Grid Container - Scrollable w/ bounded Height */}
                <div className="w-full max-h-[500px] overflow-y-auto custom-scrollbar bg-background border-2 border-border shadow-inner">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 w-full p-6 overflow-visible">
                  {filteredRequirements.map((req) => {
                    const assignedWorker = allocations[req.id];
                    const isDragOver = dragOverSlotKey === req.id;
                    const hasConflict = conflictSlotKey === req.id;
                    const dept = DEPARTMENTS[req.dept] || { color: '#000000', prefix: 'RE' };
                    
                    const fadeClass = 'opacity-100 scale-100';

                    const isInspected = inspectedSlot && inspectedSlot.id === req.id;

                    return (
                      <motion.div
                        key={req.id}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, req.id)}
                        onDrop={(e) => handleDrop(e, req.dept, req.id, req.roleName)}
                        onClick={() => {
                          if (assignedWorker) {
                            handleDeallocate(req.id);
                          } else {
                            setInspectedSlot({
                              id: req.id,
                              dept: req.dept,
                              roleName: req.roleName,
                              slotIndex: req.slotIndex,
                              worker: null
                            });
                          }
                        }}
                        title={assignedWorker 
                          ? 'Click to unassign worker'
                          : `[${req.dept}] ${req.roleName} (Dashed Slot - Drag ${req.dept} worker here)`
                        }
                        whileHover={{ scale: 1.08, zIndex: 10 }}
                        onMouseEnter={(e) => handleSlotMouseEnter(e, assignedWorker)}
                        onMouseLeave={handleSlotMouseLeave}
                        className={`w-14 h-14 group flex flex-col items-center justify-center border-2 rounded-none cursor-pointer transition-all select-none duration-150 relative shrink-0 font-mono shadow-3xs
                          ${fadeClass}
                          ${hasConflict ? 'bg-red-50 border-red-500 animate-pulse' : ''}
                          ${isDragOver ? 'scale-[1.05] shadow border-solid' : ''}
                          ${isInspected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        `}
                        style={{
                          borderColor: hasConflict ? '#EF4444' : (isDragOver ? dept.color : dept.color),
                          backgroundColor: hasConflict ? '#FEE2E2' : (assignedWorker ? dept.color : dept.color + '1A'),
                          borderStyle: assignedWorker ? 'solid' : 'dashed',
                          color: assignedWorker ? '#FFFFFF' : dept.color
                        }}
                      >
                        {assignedWorker ? (
                          // Occupied Seat Details: Initials
                          <div className="flex flex-col items-center justify-center w-full h-full leading-none">
                            <span className="text-[11px] font-extrabold tracking-tighter">
                              {assignedWorker.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                            </span>
                            <span className="text-[6.5px] opacity-75 font-bold mt-1 uppercase">
                              {dept.prefix}-{String(req.slotIndex).padStart(2, '0')}
                            </span>
                          </div>
                        ) : (
                          // Vacant Seat Details: Initials + Index
                          <div className="flex flex-col items-center justify-center w-full h-full leading-none opacity-80">
                            <span className="text-[10px] font-extrabold tracking-tight">
                              {dept.prefix}
                            </span>
                            <span className="text-[7.5px] font-bold opacity-60 mt-1 font-mono">
                              {String(req.slotIndex).padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        {/* Dropover dynamic indicator */}
                        {isDragOver && (
                          <div 
                            className="absolute inset-0.5 rounded-lg animate-ping opacity-35 pointer-events-none" 
                            style={{ backgroundColor: dept.color }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                </div>

                {/* Consolidated Workspace Inspector Panel */}
                <div className="w-full bg-muted border-2 border-border p-5 rounded-none shadow-sm">
                  {inspectedSlot ? (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-none flex flex-col items-center justify-center text-white shrink-0 shadow border border-white/20"
                          style={{ backgroundColor: DEPARTMENTS[inspectedSlot.dept]?.color }}
                        >
                          <span className="text-xs font-black leading-none uppercase">
                            {DEPARTMENTS[inspectedSlot.dept]?.prefix}
                          </span>
                          <span className="text-[8px] font-mono mt-1 font-bold opacity-80 leading-none">
                            {String(inspectedSlot.slotIndex).padStart(2, '0')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold uppercase text-muted-foreground">Requirement Slot Details</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[8px] font-bold uppercase font-mono text-primary">
                              {inspectedSlot.dept} Department
                            </span>
                          </div>
                          <h4 className="font-bold text-sm uppercase text-foreground leading-tight mt-0.5">
                            {inspectedSlot.roleName}
                          </h4>
                        </div>
                      </div>

                      {/* Inspected assignment state */}
                      <div className="flex-grow md:flex-grow-0 flex items-center justify-between md:justify-end gap-6">
                        {inspectedSlot.worker ? (
                          <>
                            <div className="text-left md:text-right leading-none">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase block">DEPLOYED PERSONNEL</span>
                              <span className="font-extrabold text-sm text-foreground block mt-1">
                                {inspectedSlot.worker.name} ({inspectedSlot.worker.gender})
                              </span>
                              <span className="text-[9.5px] font-mono text-emerald-600 block mt-1 font-bold">
                                Rate: ₹{inspectedSlot.worker.ratePerDay}/Day • Agency: {inspectedSlot.worker.agency}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeallocate(inspectedSlot.id)}
                              className="px-3.5 py-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-[10px] font-mono font-black uppercase transition-all rounded-none cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <X className="w-3.5 h-3.5" /> Recall
                            </button>
                          </>
                        ) : (
                          <div className="text-right font-mono text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-primary" />
                            <span>Vacant requirement slot. Drag matching staff to assign.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 font-mono text-[10px] font-semibold text-muted-foreground uppercase flex items-center justify-center gap-1.5">
                      <Info className="w-4 h-4 text-primary shrink-0" />
                      <span>Click any requirement slot inside the grid to inspect details or deallocate staff.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

        </div>
      </div>

        {/* Right Section: Available Roster Pool (Takes 1 Column) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Roster Dispatch Pool
            </h2>
          </div>

          <div className="bg-card border-2 border-border shadow divide-y-2 divide-border rounded-none overflow-hidden">
            
            {/* Search filter for roster */}
            <div className="p-4 bg-muted space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Click any service segment to expand its available personnel pool. Drag cards into matching slots.
              </p>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Roster..."
                  value={rosterSearchQuery}
                  onChange={(e) => setRosterSearchQuery(e.target.value)}
                  className="input-field pl-9"
                />
              </div>

              {/* Roster Category Filter Controls */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Status Filter */}
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</span>
                  <select
                    value={rosterFilterStatus}
                    onChange={(e) => setRosterFilterStatus(e.target.value)}
                    className="w-full bg-background border-2 border-border px-1.5 py-1 text-[9px] font-black uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="DEPLOYED">Deployed</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Gender</span>
                  <select
                    value={rosterFilterGender}
                    onChange={(e) => setRosterFilterGender(e.target.value)}
                    className="w-full bg-background border-2 border-border px-1.5 py-1 text-[9px] font-black uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                {/* Agency Filter */}
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Agency</span>
                  <select
                    value={rosterFilterAgency}
                    onChange={(e) => setRosterFilterAgency(e.target.value)}
                    className="w-full bg-background border-2 border-border px-1.5 py-1 text-[9px] font-black uppercase focus:outline-none cursor-pointer truncate"
                  >
                    {uniqueAgencies.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency === 'ALL' ? 'All Agencies' : agency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List of 11 Service Segments Accordions */}
            <div className="divide-y-2 divide-border max-h-[480px] overflow-y-auto custom-scrollbar bg-card">
              {Object.keys(DEPARTMENTS).map((key) => {
                const dept = DEPARTMENTS[key];
                const filtered = filteredRosterWorkers(key);
                const isExpanded = expandedService === key || (rosterSearchQuery !== '' && filtered.length > 0);

                return (
                  <div key={key} className="overflow-hidden">
                    <button
                      onClick={() => setExpandedService(isExpanded ? null : key)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-muted transition-colors font-bold uppercase cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3.5 h-3.5 border-2 border-border animate-none" style={{ backgroundColor: dept.color }} />
                        <span className="text-xs font-black tracking-wide text-foreground">{dept.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-[10px] font-mono">
                        <span className="text-muted-foreground font-bold">({filtered.length})</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Worker Cards Drawer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="bg-muted/30 border-t-2 border-border overflow-hidden custom-scrollbar"
                        >
                          <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto thin-scrollbar">
                            {filtered.length === 0 ? (
                              <p className="text-center font-mono text-[10px] text-muted-foreground p-4">
                                No {dept.name} personnel matches search
                              </p>
                            ) : (
                              filtered.map((worker) => {
                                // Verify if worker is already allocated on the active date/zone
                                const activeSlotKey = Object.keys(allocations).find(k => allocations[k]?.id === worker.id);
                                const isAllocated = !!activeSlotKey;

                                return (
                                  <div
                                    key={worker.id}
                                    draggable={!isAllocated}
                                    onDragStart={(e) => handleDragStart(e, worker)}
                                    onDragEnd={handleDragEnd}
                                    className={`p-3 border-2 text-foreground transition-all select-none relative rounded-none
                                      ${isAllocated 
                                        ? 'border-border bg-muted/50 opacity-40 cursor-not-allowed' 
                                        : 'border-border bg-card cursor-grab active:cursor-grabbing hover:border-foreground hover:shadow-xs'
                                      }
                                      ${draggedWorker?.id === worker.id ? 'opacity-30 scale-95 border-dashed border-primary' : ''}
                                    `}
                                    style={!isAllocated ? { borderLeftColor: dept.color, borderLeftWidth: '4px' } : {}}
                                  >
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <p className="font-extrabold text-[11px] uppercase tracking-wide leading-tight text-foreground">
                                          {worker.name}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground font-bold mt-0.5 leading-none font-sans">
                                          {worker.role}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground font-mono font-bold leading-none">
                                          <span>{worker.gender}</span>
                                          <span>•</span>
                                          <span>AGENCY: {worker.agency}</span>
                                        </div>
                                      </div>

                                      {/* Cost tag */}
                                      <div className="text-right leading-none shrink-0">
                                        <span className="font-extrabold text-xs text-primary font-mono block">
                                          ₹{worker.ratePerDay}
                                        </span>
                                        <span className="text-[8px] font-mono text-muted-foreground mt-0.5 block font-bold">
                                          / DAY
                                        </span>
                                      </div>
                                    </div>

                                    {/* Allocated badge */}
                                    {isAllocated && (
                                      <div className="absolute inset-0 bg-muted/10 backdrop-blur-3xs rounded-none flex items-center justify-center">
                                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-none text-[8px] font-mono font-black border-2 border-border shadow uppercase">
                                          Deployed
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
