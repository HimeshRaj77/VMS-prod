import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Building2, Users, CalendarDays, ArrowUpRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import adminApi from '../../api/adminApi';
import MetricCard from '../../components/ui/MetricCard';
import SectionHeader from '../../components/ui/SectionHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

const trendData = [
  { name: 'Mon', quotations: 45, manpower: 120 },
  { name: 'Tue', quotations: 52, manpower: 132 },
  { name: 'Wed', quotations: 38, manpower: 101 },
  { name: 'Thu', quotations: 65, manpower: 167 },
  { name: 'Fri', quotations: 48, manpower: 110 },
  { name: 'Sat', quotations: 85, manpower: 210 },
  { name: 'Sun', quotations: 92, manpower: 250 },
];

const mockRecentQuotations = [
  { id: 1, agencyName: 'Alpha Events Ltd', date: 'Oct 24, 2026', amount: '₹45,000', status: 'success', statusLabel: 'Parsed', confidence: 98 },
  { id: 2, agencyName: 'Beta Productions', date: 'Oct 23, 2026', amount: '₹12,500', status: 'warning', statusLabel: 'Review', confidence: 75 },
  { id: 3, agencyName: 'Gamma Security', date: 'Oct 23, 2026', amount: '₹89,200', status: 'success', statusLabel: 'Parsed', confidence: 99 },
  { id: 4, agencyName: 'Delta Staffing', date: 'Oct 22, 2026', amount: '₹34,000', status: 'danger', statusLabel: 'Failed', confidence: 42 },
];

export default function AdminDashboard() {
  const [quotations, setQuotations] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quotationsRes, agenciesRes] = await Promise.all([
          adminApi.get('/admin/quotations'),
          adminApi.get('/admin/agencies')
        ]);
        
        setQuotations(quotationsRes.data || []);
        setAgencies(agenciesRes.data || []);
        setIsDemoMode(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data, falling back to demo mode:', err);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine whether to use mock fallback data
  const useMockData = isDemoMode || (!loading && quotations.length === 0 && agencies.length === 0);

  // Compute metrics dynamically
  const displayedQuotationsCount = useMockData 
    ? "1,248" 
    : quotations.length.toLocaleString();

  const displayedAgenciesCount = useMockData 
    ? "64" 
    : agencies.length.toLocaleString();

  const displayedManpower = useMockData 
    ? "4,820" 
    : quotations.reduce((acc, q) => acc + (q.structuredQuotation?.totalManpower || 0), 0).toLocaleString();

  const displayedRisks = useMockData 
    ? "14" 
    : (quotations.filter(q => q.extractionStatus === 'failed').length + 
       quotations.filter(q => q.structuredQuotation && q.structuredQuotation.extractionConfidence < 0.8).length).toString();

  // Dynamic Chart Telemetry
  let chartData = trendData;
  if (!useMockData && quotations.length > 0) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const manpower = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    quotations.forEach(q => {
      const dayName = days[new Date(q.createdAt).getDay()];
      counts[dayName] = (counts[dayName] || 0) + 1;
      manpower[dayName] = (manpower[dayName] || 0) + (q.structuredQuotation?.totalManpower || 0);
    });

    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    chartData = order.map(dayName => ({
      name: dayName,
      quotations: counts[dayName] || 0,
      manpower: manpower[dayName] || 0
    }));

    const hasValues = chartData.some(d => d.quotations > 0 || d.manpower > 0);
    if (!hasValues) {
      chartData = trendData;
    }
  }

  // Dynamic Insights Feed
  const insights = [];
  if (!useMockData) {
    quotations.forEach(q => {
      const financialRisks = q.structuredQuotation?.structuredData?.quotation?.financial_risks || [];
      const operationalRisks = q.structuredQuotation?.structuredData?.quotation?.operational_risks || [];
      const company = q.structuredQuotation?.vendorCompany || q.agency?.agencyName || 'Vendor';

      financialRisks.forEach((risk, i) => {
        if (insights.length < 5) {
          insights.push({
            id: `fin-${q.id}-${i}`,
            badge: 'FINANCIAL RISK',
            colorClass: 'bg-destructive text-destructive-foreground border border-border',
            msg: `${company}: ${risk}`
          });
        }
      });

      operationalRisks.forEach((risk, i) => {
        if (insights.length < 5) {
          insights.push({
            id: `ops-${q.id}-${i}`,
            badge: 'OPERATIONAL RISK',
            colorClass: 'bg-foreground text-background',
            msg: `${company}: ${risk}`
          });
        }
      });
    });
  }

  // Fallback insights
  if (insights.length === 0) {
    insights.push(
      {
        id: 'mock-1',
        badge: 'ANOMALY DETECTED',
        colorClass: 'bg-foreground text-background',
        msg: 'Gamma Security quotation is 35% above the standard zone baseline.'
      },
      {
        id: 'mock-2',
        badge: 'URGENT ACTION',
        colorClass: 'bg-destructive text-destructive-foreground border border-border',
        msg: 'Main Stage Setup is short by 45 personnel for Day 1. Immediate allocation required.'
      }
    );
  }

  // Recent Extractions Table Data
  const quotationColumns = [
    { header: 'Agency', accessorKey: 'agencyName', cell: (row) => <span className="font-bold text-foreground">{row.agencyName}</span> },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Amount', accessorKey: 'amount', isNumeric: true },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} label={row.statusLabel} /> },
    { header: 'AI Conf.', accessorKey: 'confidence', cell: (row) => <span className="font-mono bg-secondary/20 text-foreground px-1 border border-border">{row.confidence}%</span> }
  ];

  const displayedTableData = useMockData
    ? mockRecentQuotations
    : quotations.slice(0, 10).map(q => ({
        id: q.id,
        agencyName: q.agency?.agencyName || 'Unknown Agency',
        date: new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: q.structuredQuotation?.grandTotal ? `₹${q.structuredQuotation.grandTotal.toLocaleString()}` : 'N/A',
        status: q.extractionStatus === 'success' ? 'success' : q.extractionStatus === 'pending' ? 'warning' : 'danger',
        statusLabel: q.extractionStatus === 'success' ? 'Parsed' : q.extractionStatus === 'pending' ? 'Pending' : 'Failed',
        confidence: q.structuredQuotation?.extractionConfidence 
          ? Math.round(q.structuredQuotation.extractionConfidence * 100) 
          : (q.extractionStatus === 'failed' ? 0 : 95)
      }));

  // Operations Schedule Widget
  const displayedOpsSchedule = [];
  if (!useMockData) {
    quotations.forEach(q => {
      const services = q.structuredQuotation?.structuredData?.services || [];
      const company = q.structuredQuotation?.vendorCompany || q.agency?.agencyName || 'Vendor';
      services.forEach(s => {
        if (displayedOpsSchedule.length < 3 && s.manpower_count) {
          const dateObj = new Date(q.createdAt);
          displayedOpsSchedule.push({
            day: dateObj.getDate().toString(),
            month: dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            title: `${s.service_name || s.department_name || 'SERVICE'} (${company})`,
            count: s.manpower_count
          });
        }
      });
    });
  }

  // Fallback operations schedule
  if (displayedOpsSchedule.length === 0) {
    displayedOpsSchedule.push(
      { day: '24', month: 'OCT', title: 'MAIN STAGE SETUP', count: 120 },
      { day: '25', month: 'OCT', title: 'SECURITY BRIEFING', count: 45 },
      { day: '26', month: 'OCT', title: 'DAY 1 LIVE OPS', count: 850 }
    );
  }

  return (
    <div className="space-y-10 pb-12 text-foreground">
      <SectionHeader 
        title={useMockData ? "Mission Control (Demo)" : "Mission Control"} 
        subtitle="Global operational overview and real-time infrastructure metrics."
        action={<button className="btn-primary" onClick={() => window.print()}>Generate Daily Report</button>}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Quotations" 
          value={displayedQuotationsCount} 
          icon={FileSpreadsheet} 
          trend={useMockData ? "12.5%" : null} 
          colorClass="op-blue" 
          trendUp={true}
        />
        <MetricCard 
          title="Active Agencies" 
          value={displayedAgenciesCount} 
          icon={Building2} 
          trend={useMockData ? "4.2%" : null} 
          colorClass="op-purple" 
          trendUp={true}
        />
        <MetricCard 
          title="Manpower Assigned" 
          value={displayedManpower} 
          icon={Users} 
          trend={useMockData ? "18.1%" : null} 
          colorClass="op-green" 
          trendUp={true}
        />
        <MetricCard 
          title="Critical Risks" 
          value={displayedRisks} 
          icon={AlertTriangle} 
          trend={useMockData ? "2.4%" : null} 
          colorClass="op-red" 
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-card border-2 border-border p-6 shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-border">
            <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">Procurement Volume</h3>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs font-bold uppercase"><div className="w-3 h-3 bg-accent border border-border mr-2"></div>Quotations</span>
              <span className="flex items-center text-xs font-bold uppercase"><div className="w-3 h-3 bg-foreground border border-border mr-2"></div>Manpower</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center font-mono text-muted-foreground">
                LOADING CORE TELEMETRY...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: 'Space Mono', fill: 'var(--muted-foreground)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontFamily: 'Space Mono', fill: 'var(--muted-foreground)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '2px solid var(--border)', borderRadius: '0', color: 'var(--card-foreground)', boxShadow: 'var(--shadow-sm)' }}
                    itemStyle={{ fontFamily: 'Space Mono', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="manpower" stackId="1" stroke="var(--foreground)" fill="var(--foreground)" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="quotations" stackId="2" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-secondary border-2 border-border p-6 shadow flex flex-col text-secondary-foreground">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-border">
            <h3 className="text-xl font-bold uppercase tracking-tight">AI Insights</h3>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-4 flex-grow overflow-y-auto max-h-[300px] thin-scrollbar">
            {loading ? (
              <div className="text-center font-mono text-xs text-muted-foreground p-8">
                SCANNING VENDOR PIPELINES...
              </div>
            ) : (
              insights.map((insight) => (
                <div key={insight.id} className="bg-card border-2 border-border p-4 shadow-sm text-foreground">
                  <span className={`${insight.colorClass} text-[10px] uppercase font-bold px-2 py-0.5 inline-block mb-2`}>
                    {insight.badge}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{insight.msg}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations Table */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-foreground uppercase">Recent Extractions</h3>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {useMockData ? "DEMO ACTIVE" : "REAL-TIME LOGS"}
            </span>
          </div>
          {loading ? (
            <div className="border-2 border-border bg-card p-12 text-center font-mono text-muted-foreground">
              RETRIEVING AUDIT ARCHIVE...
            </div>
          ) : (
            <DataTable columns={quotationColumns} data={displayedTableData} />
          )}
        </div>

        {/* Event Operations Widget */}
        <div className="bg-card border-2 border-border p-6 flex flex-col shadow">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-border">
            <h3 className="text-xl font-bold text-foreground uppercase">Ops Schedule</h3>
            <button className="p-1 border-2 border-transparent hover:border-border transition-colors text-foreground">
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3 flex-grow overflow-y-auto max-h-[260px] thin-scrollbar">
            {loading ? (
              <div className="text-center font-mono text-xs text-muted-foreground p-8">
                COMPILING CALENDAR...
              </div>
            ) : (
              displayedOpsSchedule.map((event, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="flex items-center p-3 border-2 border-border bg-muted cursor-pointer group hover:bg-card text-foreground animate-fadeIn"
                >
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-foreground text-background mr-4 shrink-0">
                    <span className="text-[10px] font-bold">{event.month}</span>
                    <span className="text-xl font-mono font-bold leading-none">{event.day}</span>
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h4 className="font-bold text-xs tracking-wide truncate uppercase">{event.title}</h4>
                    <div className="flex items-center text-xs font-mono font-medium mt-1 text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" /> {event.count} ALLOCATED
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
