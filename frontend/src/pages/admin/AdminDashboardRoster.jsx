import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Layers, Truck, HeartPulse, Utensils, Flame, Tv, 
  Droplets, Sparkles, Palette, AlertTriangle, Info, Search, 
  Users, Grid, Loader2, Filter, IndianRupee, Calendar, MapPin,
  Download
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import { jsPDF } from 'jspdf';

// Standard 11 service specifications matching WorkforceAllocation.jsx
const DEPARTMENTS = {
  MAWAID: {
    name: 'MAWAID',
    label: 'Catering & Food',
    color: '#9A3412',
    bgColor: 'bg-[#9A3412]/10',
    textColor: 'text-[#9A3412]',
    borderColor: 'border-[#9A3412]',
    prefix: 'MW',
    icon: Utensils
  },
  AVIT: {
    name: 'AVIT',
    label: 'AV Technical',
    color: '#581C87',
    bgColor: 'bg-[#581C87]/10',
    textColor: 'text-[#581C87]',
    borderColor: 'border-[#581C87]',
    prefix: 'AV',
    icon: Tv
  },
  SEHAT: {
    name: 'SEHAT',
    label: 'Medical & Aid',
    color: '#064E3B',
    bgColor: 'bg-[#064E3B]/10',
    textColor: 'text-[#064E3B]',
    borderColor: 'border-[#064E3B]',
    prefix: 'SH',
    icon: HeartPulse
  },
  'FIRE SAFETY': {
    name: 'FIRE SAFETY',
    label: 'Fire Safety',
    color: '#991B1B',
    bgColor: 'bg-[#991B1B]/10',
    textColor: 'text-[#991B1B]',
    borderColor: 'border-[#991B1B]',
    prefix: 'FS',
    icon: Flame
  },
  'FLOW MANAGEMENT': {
    name: 'FLOW MANAGEMENT',
    label: 'Crowd Flow',
    color: '#1E40AF',
    bgColor: 'bg-[#1E40AF]/10',
    textColor: 'text-[#1E40AF]',
    borderColor: 'border-[#1E40AF]',
    prefix: 'FM',
    icon: Layers
  },
  KARAMAT: {
    name: 'KARAMAT',
    label: 'VIP Protocol',
    color: '#701A75',
    bgColor: 'bg-[#701A75]/10',
    textColor: 'text-[#701A75]',
    borderColor: 'border-[#701A75]',
    prefix: 'KR',
    icon: Sparkles
  },
  SABEEL: {
    name: 'SABEEL',
    label: 'Water Supply',
    color: '#0E7490',
    bgColor: 'bg-[#0E7490]/10',
    textColor: 'text-[#0E7490]',
    borderColor: 'border-[#0E7490]',
    prefix: 'SB',
    icon: Droplets
  },
  TRANSPORT: {
    name: 'TRANSPORT',
    label: 'Fleet Services',
    color: '#3730A3',
    bgColor: 'bg-[#3730A3]/10',
    textColor: 'text-[#3730A3]',
    borderColor: 'border-[#3730A3]',
    prefix: 'TR',
    icon: Truck
  },
  SECURITY: {
    name: 'SECURITY',
    label: 'Guarding & Patrol',
    color: '#111827',
    bgColor: 'bg-[#111827]/10',
    textColor: 'text-[#111827]',
    borderColor: 'border-[#111827]',
    prefix: 'SC',
    icon: Shield
  },
  NAZAFAT: {
    name: 'NAZAFAT',
    label: 'Housekeeping',
    color: '#BE185D',
    bgColor: 'bg-[#BE185D]/10',
    textColor: 'text-[#BE185D]',
    borderColor: 'border-[#BE185D]',
    prefix: 'NZ',
    icon: Palette
  },
  TAZYEEN: {
    name: 'TAZYEEN',
    label: 'Branding & Decor',
    color: '#4D7C0F',
    bgColor: 'bg-[#4D7C0F]/10',
    textColor: 'text-[#4D7C0F]',
    borderColor: 'border-[#4D7C0F]',
    prefix: 'TZ',
    icon: Palette
  }
};

export default function AdminDashboardRoster() {
  const [loading, setLoading] = useState(true);
  const [rawAllocations, setRawAllocations] = useState({});
  const [flatAllocations, setFlatAllocations] = useState([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

  // Load backend allocations
  useEffect(() => {
    const loadAllocations = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get('/admin/allocations');
        const data = res.data || {};
        setRawAllocations(data);

        // Flatten the data format: { [date_zone]: { [slotKey]: worker } }
        // into a clean array of allocation rows
        const flatList = [];
        
        Object.keys(data).forEach(dateZoneKey => {
          const [date, zone] = dateZoneKey.split('_');
          const slotMap = data[dateZoneKey] || {};

          Object.keys(slotMap).forEach(slotKey => {
            const worker = slotMap[slotKey];
            if (worker && worker.id) {
              flatList.push({
                id: `${dateZoneKey}_${slotKey}`,
                date,
                zone,
                slotKey,
                workerId: worker.id,
                workerName: worker.name,
                gender: worker.gender || 'Male',
                dept: worker.dept || 'SECURITY',
                agency: worker.agency || 'Independent Agency',
                ratePerDay: worker.ratePerDay || 300,
                role: worker.role || 'Personnel'
              });
            }
          });
        });

        setFlatAllocations(flatList);
      } catch (err) {
        console.error('Error loading allocations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllocations();
  }, []);

  // Compute unique values for filter dropdowns
  const availableDates = [...new Set(flatAllocations.map(a => a.date))].sort();
  const availableZones = [...new Set(flatAllocations.map(a => a.zone))].sort();

  // Filter allocation items dynamically
  const filteredAllocations = flatAllocations.filter(alloc => {
    const matchesSearch = searchQuery === '' ||
      alloc.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alloc.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alloc.agency.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = filterDate === 'ALL' || alloc.date === filterDate;
    const matchesZone = filterZone === 'ALL' || alloc.zone === filterZone;
    const matchesDept = filterDept === 'ALL' || alloc.dept.toUpperCase() === filterDept.toUpperCase();

    return matchesSearch && matchesDate && matchesZone && matchesDept;
  });

  // Dynamic Telemetry Metrics
  const totalAllocated = filteredAllocations.length;
  const totalCost = filteredAllocations.reduce((sum, item) => sum + (item.ratePerDay || 0), 0);
  const totalAgencies = [...new Set(filteredAllocations.map(a => a.agency))].length;

  // Custom Programmatic A4 jsPDF Generator
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // 210
      const pageHeight = doc.internal.pageSize.getHeight(); // 297

      // Setup colors
      const primaryColor = [139, 58, 42]; // #8B3A2A
      const textColor = [31, 41, 55]; // #1f2937
      const borderDark = [31, 41, 55]; // #1f2937

      const marginX = 15;
      let currentY = 15;

      // 1. --- BRAND BANNER HEADER ---
      // Brutalist black shadow backing
      doc.setFillColor(31, 41, 55);
      doc.rect(marginX + 1.5, currentY + 1.5, pageWidth - (marginX * 2), 24, 'F');
      
      // Front banner block
      doc.setFillColor(139, 58, 42); // #8B3A2A
      doc.setDrawColor(31, 41, 55);
      doc.setLineWidth(0.8);
      doc.rect(marginX, currentY, pageWidth - (marginX * 2), 24, 'FD');

      // Banner Labels
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('VMS ADMIN CONSOLE', marginX + 8, currentY + 9.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(252, 165, 165); // reddish tint
      doc.text('OFFICIAL WORKFORCE ROSTER DISPATCH & DEPLOYMENT TELEMETRY', marginX + 8, currentY + 16.5);

      currentY += 31; // y = 46

      // 2. --- FILTER COORDINATES BLOCK ---
      // Brutalist drop shadow
      doc.setFillColor(31, 41, 55);
      doc.rect(marginX + 1, currentY + 1, pageWidth - (marginX * 2), 14, 'F');

      // Coordinates card box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(31, 41, 55);
      doc.rect(marginX, currentY, pageWidth - (marginX * 2), 14, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(31, 41, 55);
      doc.text('DEPLOYMENT COORDINATES:', marginX + 6, currentY + 5.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      
      const filterLabelDate = filterDate === 'ALL' ? 'ALL DATES' : filterDate;
      const filterLabelZone = filterZone === 'ALL' ? 'ALL ZONES' : filterZone;
      const filterLabelDept = filterDept === 'ALL' ? 'ALL DEPARTMENTS' : filterDept;
      
      doc.text(`DATE: ${filterLabelDate}    |    ZONE: ${filterLabelZone}    |    SERVICE: ${filterLabelDept}`, marginX + 6, currentY + 10);

      currentY += 21; // y = 67

      // 3. --- TELEMETRY STATS CARDS ---
      const colWidth = (pageWidth - (marginX * 2) - 8) / 3; // ~57mm
      
      // Col 1: Deployed Count
      let colX = marginX;
      doc.setFillColor(31, 41, 55);
      doc.rect(colX + 1, currentY + 1, colWidth, 18, 'F');
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(31, 41, 55);
      doc.rect(colX, currentY, colWidth, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('TOTAL PERSONNEL', colX + 5, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`${totalAllocated} Deployed`, colX + 5, currentY + 12);

      // Col 2: Total Cost
      colX = marginX + colWidth + 4;
      doc.setFillColor(31, 41, 55);
      doc.rect(colX + 1, currentY + 1, colWidth, 18, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(colX, currentY, colWidth, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('ROSTER DEPLOYMENT BUDGET', colX + 5, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(139, 58, 42); // Primary Red Accent
      doc.text(`INR ${totalCost.toLocaleString()}`, colX + 5, currentY + 12);

      // Col 3: Vendors count
      colX = marginX + (colWidth * 2) + 8;
      doc.setFillColor(31, 41, 55);
      doc.rect(colX + 1, currentY + 1, colWidth, 18, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(colX, currentY, colWidth, 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('ACTIVE CONTRACTED VENDORS', colX + 5, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`${totalAgencies} Vendors`, colX + 5, currentY + 12);

      currentY += 25; // y = 92

      // 4. --- SERVICE SEGREGATION SECTION ---
      const deptCounts = {};
      filteredAllocations.forEach(item => {
        const d = item.dept.toUpperCase();
        deptCounts[d] = (deptCounts[d] || 0) + 1;
      });

      const deptsUsed = Object.keys(deptCounts);
      if (deptsUsed.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(31, 41, 55);
        doc.text('SERVICE SEGREGATION BREAKDOWN SUMMARY', marginX, currentY);
        currentY += 4;

        let badgeX = marginX;
        let badgeY = currentY;
        const badgeH = 8;

        deptsUsed.forEach(dept => {
          const count = deptCounts[dept];
          const deptConfig = DEPARTMENTS[dept] || { label: dept };
          const badgeText = `${deptConfig.label}: ${count}`;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          const badgeW = doc.getTextWidth(badgeText) + 6;

          // Wrap to next line if it exceeds margin boundaries
          if (badgeX + badgeW > pageWidth - marginX) {
            badgeX = marginX;
            badgeY += badgeH + 3;
          }

          // Offset shadow
          doc.setFillColor(31, 41, 55);
          doc.rect(badgeX + 0.6, badgeY + 0.6, badgeW, badgeH, 'F');

          // Main badge outline
          doc.setFillColor(252, 246, 245); // light tint
          doc.setDrawColor(31, 41, 55);
          doc.rect(badgeX, badgeY, badgeW, badgeH, 'FD');

          // Text
          doc.setTextColor(139, 58, 42); // Warm Red
          doc.text(badgeText, badgeX + 3, badgeY + 5.5);

          badgeX += badgeW + 3;
        });

        currentY = badgeY + badgeH + 8; // Reset below badges
      }

      // 5. --- TABLE DEPLOYMENT LEDGER ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.text('DETAILED OPERATIONS ROSTER LEDGER', marginX, currentY);
      currentY += 4;

      const cols = [
        { title: 'Date / Zone', width: 32 },
        { title: 'Deployed Personnel', width: 44 },
        { title: 'Service / Specialized Role', width: 44 },
        { title: 'Contractor Agency', width: 38 },
        { title: 'Daily Rate', width: 22, align: 'right' }
      ];

      const drawTableHeaders = (yPos) => {
        let currentX = marginX;
        doc.setFillColor(31, 41, 55);
        doc.rect(marginX, yPos, pageWidth - (marginX * 2), 7, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);

        cols.forEach(col => {
          let textX = currentX + 3;
          if (col.align === 'right') {
            textX = currentX + col.width - 3;
            doc.text(col.title, textX, yPos + 5, { align: 'right' });
          } else {
            doc.text(col.title, textX, yPos + 5);
          }
          currentX += col.width;
        });
      };

      drawTableHeaders(currentY);
      currentY += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      filteredAllocations.forEach((item, index) => {
        // Safe page height boundary verification
        if (currentY + 11 > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
          drawTableHeaders(currentY);
          currentY += 7;
        }

        // Row background and borders
        doc.setFillColor(index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 251);
        doc.setDrawColor(31, 41, 55);
        doc.rect(marginX, currentY, pageWidth - (marginX * 2), 11, 'FD');

        let cellX = marginX;

        // Cell 1: Date & Zone
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(item.date, cellX + 3, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.text(item.zone, cellX + 3, currentY + 8.5);

        // Cell 2: Name & Gender
        cellX += cols[0].width;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(item.workerName, cellX + 3, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.text(`Gender: ${item.gender}`, cellX + 3, currentY + 8.5);

        // Cell 3: Service Group & Role
        cellX += cols[1].width;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 58, 42); // Theme warm brick color for service groups
        const deptConfig = DEPARTMENTS[item.dept.toUpperCase()] || { label: item.dept };
        doc.text(deptConfig.label, cellX + 3, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(107, 114, 128);
        doc.text(item.role, cellX + 3, currentY + 8.5);

        // Cell 4: Contractor
        cellX += cols[2].width;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(75, 85, 99);
        let agencyText = item.agency;
        if (doc.getTextWidth(agencyText) > cols[3].width - 6) {
          agencyText = agencyText.substring(0, 18) + '...';
        }
        doc.text(agencyText, cellX + 3, currentY + 6.5);

        // Cell 5: Daily Wage
        cellX += cols[3].width;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(`INR ${item.ratePerDay}`, cellX + cols[4].width - 3, currentY + 6.5, { align: 'right' });

        currentY += 11;
      });

      // 6. --- FOOTER SIGN-OFF SECTION ---
      if (currentY + 22 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }

      currentY += 4;
      doc.setDrawColor(31, 41, 55);
      doc.setLineWidth(0.8);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      
      currentY += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text('ROSTER AUTHENTICITY RECORD STAMP:', marginX, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('AUTHORIZED OPERATIONS DISPATCH', marginX, currentY + 4);
      doc.text('© VMS CORE SYSTEMS STAGED LEDGERS', marginX, currentY + 7);

      // Cost Grand Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(31, 41, 55);
      doc.text('GRAND ROSTER DAILY COST:', pageWidth - marginX - 45, currentY, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(139, 58, 42); // Accent theme
      doc.text(`INR ${totalCost.toLocaleString()}`, pageWidth - marginX, currentY + 5, { align: 'right' });

      // Save document
      const fileLabelDate = filterDate === 'ALL' ? 'AllDates' : filterDate.replace(/\//g, '-');
      const fileLabelZone = filterZone === 'ALL' ? 'AllZones' : filterZone.replace(/\s+/g, '');
      doc.save(`VMS_Roster_${fileLabelDate}_${fileLabelZone}.pdf`);

    } catch (pdfError) {
      console.error('[jsPDF Export] Error occurred during layout compilation:', pdfError);
      alert('Failed to generate roster PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] font-sans p-6 text-foreground bg-background">
        <div className="card p-8 max-w-sm text-center shadow space-y-4 rounded-none">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Loading Roster Ledgers</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interrogating PostgreSQL databases, populating active event parameters, and building deployment summaries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12 bg-background text-foreground antialiased select-none">
      
      {/* Header controls section */}
      <div className="bg-card border-2 border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow animate-fadeIn">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Roster Management Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Reviewing live worker allocations, daily deployment costs, and agency contracts written in PostgreSQL.
          </p>
        </div>
        
        <button
          onClick={handleDownloadPDF}
          className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-2.5 px-4 shadow shadow-[4px_4px_0px_#111827] hover:shadow-[2px_2px_0px_#111827] active:scale-95 transition-all select-none cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" /> Download PDF Roster
        </button>
      </div>

      {/* Roster Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-card border-2 border-border p-5 shadow flex items-center justify-between rounded-none">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Active Personnel Roster</span>
            <span className="text-2xl font-black mt-1.5 block text-foreground leading-none">{totalAllocated} Deployed</span>
          </div>
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-none shadow-3xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border-2 border-border p-5 shadow flex items-center justify-between rounded-none">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Roster Budget Rate</span>
            <span className="text-2xl font-black mt-1.5 block text-foreground leading-none">₹{totalCost.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center rounded-none shadow-3xs shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border-2 border-border p-5 shadow flex items-center justify-between rounded-none">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Active Contractor Agencies</span>
            <span className="text-2xl font-black mt-1.5 block text-foreground leading-none">{totalAgencies} Vendors</span>
          </div>
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center rounded-none shadow-3xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Roster Controls and Listing Card */}
      <div className="card p-6 space-y-6">
        
        {/* Filtering Options Grid */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b-2 border-border pb-6">
          <div>
            <h2 className="text-sm font-bold uppercase text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Allocation Ledgers & Audits
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Narrow allocations by active date parameters, zones, or specific service departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-9 pr-8 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="ALL">All Dates</option>
                {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Zone Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="pl-9 pr-8 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="ALL">All Zones</option>
                {availableZones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            {/* Department selector */}
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="pl-9 pr-8 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {Object.keys(DEPARTMENTS).map(key => (
                  <option key={key} value={key}>{DEPARTMENTS[key].label}</option>
                ))}
              </select>
            </div>

            {/* Roster query search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search Roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-background border-2 border-border text-foreground rounded-none text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Ledger Grid / Listing Table */}
        {filteredAllocations.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-border text-center rounded-none bg-muted">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="font-mono text-xs text-muted-foreground uppercase font-bold">
              No historical database allocations match your filters.
            </p>
          </div>
        ) : (
          <div className="border-2 border-border rounded-none shadow-sm overflow-x-auto bg-card">
            <table className="w-full text-left border-collapse text-[11px] font-medium min-w-[800px]">
              <thead className="bg-muted sticky top-0 z-10 border-b-2 border-border text-muted-foreground font-mono text-[8px] uppercase font-bold">
                <tr>
                  <th className="py-3.5 pl-4">Deployed Personnel</th>
                  <th className="py-3.5">Deployment Coordinates</th>
                  <th className="py-3.5">Assigned Service Group</th>
                  <th className="py-3.5">Contractor Agency</th>
                  <th className="py-3.5 pr-4 text-right">Daily Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border text-foreground bg-card">
                {filteredAllocations.map((alloc) => {
                  const deptConfig = DEPARTMENTS[alloc.dept.toUpperCase()] || {
                    label: alloc.dept,
                    color: '#64748B',
                    icon: Info,
                    bgColor: 'bg-slate-500/10',
                    textColor: 'text-slate-500'
                  };
                  const DeptIcon = deptConfig.icon;
                  
                  return (
                    <tr key={alloc.id} className="hover:bg-muted/40 transition-colors">
                      {/* Name & Aadhaar */}
                      <td className="py-4.5 pl-4 flex items-center space-x-3.5">
                        <div className="w-8 h-8 rounded-none border border-border bg-muted flex items-center justify-center shrink-0 shadow-3xs text-[10px] font-mono font-bold">
                          {alloc.workerName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-[12px] uppercase text-foreground leading-tight">{alloc.workerName}</p>
                          <p className="text-[9.5px] text-muted-foreground font-mono font-bold mt-1 leading-none">
                            Gender: {alloc.gender}
                          </p>
                        </div>
                      </td>

                      {/* Coordinates: Date and Zone */}
                      <td className="py-4.5 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground flex items-center gap-1.5 leading-none">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {alloc.date}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 leading-none">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {alloc.zone}
                          </span>
                        </div>
                      </td>

                      {/* Service Group & Role */}
                      <td className="py-4.5">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`px-2 py-0.5 border text-[8px] font-mono font-black uppercase tracking-wider ${deptConfig.bgColor} ${deptConfig.textColor} ${deptConfig.borderColor} border-opacity-30`}
                            style={{ borderColor: deptConfig.color + '4D' }}
                          >
                            {deptConfig.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-bold leading-none">
                          {alloc.role}
                        </p>
                      </td>

                      {/* Contractor agency */}
                      <td className="py-4.5 font-bold text-xs uppercase text-foreground">
                        {alloc.agency}
                      </td>

                      {/* Rate per day */}
                      <td className="py-4.5 pr-4 text-right">
                        <span className="font-extrabold text-sm text-primary font-mono block">
                          ₹{alloc.ratePerDay}
                        </span>
                        <span className="text-[8px] font-mono text-muted-foreground mt-0.5 block font-bold leading-none">
                          / DAY RATE
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
