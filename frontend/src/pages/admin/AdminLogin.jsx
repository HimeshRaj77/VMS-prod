import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldAlert, Users, ClipboardList, BarChart3, ShieldCheck } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Logo from '../../components/Logo';

// ── Demo credentials ─────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'test@gmail.com';
const DEMO_PASSWORD = 'test@gmail.com';

const FEATURES = [
  {
    icon: Users,
    title: 'Roster Coordination',
    desc: 'Track and organize personnel slots across active dates and zones.',
  },
  {
    icon: ClipboardList,
    title: 'Requirements Ledger',
    desc: 'Define and manage dynamic requirements quotas for all services.',
  },
  {
    icon: BarChart3,
    title: 'Allocation Insights',
    desc: 'Analyze deployment coverage, costs, and statistics in real-time.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Operations',
    desc: 'End-to-end data security and verified administrator protocols.',
  },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Static demo bypass — no backend needed
    if (formData.email === DEMO_EMAIL && formData.password === DEMO_PASSWORD) {
      localStorage.setItem('adminToken', 'dev-admin-token-bypass');
      localStorage.setItem('adminName', 'Admin Demo');
      setTimeout(() => navigate('/admin'), 500);
      return;
    }

    try {
      const response = await adminApi.post('/admin/login', formData);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminName', response.data.fullName);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans">

      {/* ── Left: Dark Branded Panel (desktop only) ───────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-[#111827] flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-primary" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10 bg-primary" />
          {/* Accent mesh SVG */}
          <svg className="absolute right-0 top-1/3 opacity-5" width="220" height="300" viewBox="0 0 220 300" fill="none">
            {[0,1,2,3,4].map((row) =>
              [0,1,2].map((col) => {
                const cx = col * 70 + (row % 2) * 35 + 20;
                const cy = row * 60 + 20;
                return (
                  <polygon
                    key={`${row}-${col}`}
                    points={`${cx},${cy-25} ${cx+22},${cy-12} ${cx+22},${cy+12} ${cx},${cy+25} ${cx-22},${cy+12} ${cx-22},${cy-12}`}
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Logo subtitle="Admin Console" size="md" variant="dark" />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/10 mb-4 rounded-none text-xs font-black uppercase tracking-widest text-primary">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Restoring order<br />to workforce logistics<br />and allocations.
          </h2>
          <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-xs font-medium">
            Access the centralized administration portal to dispatch rosters, monitor zone requirements, and verify contractor quotients.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-relaxed font-medium">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Admin Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo subtitle="Admin Console" size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Restricted Access
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Please enter your system administrator credentials to authenticate.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 text-sm mb-6 border-2 border-destructive flex items-start gap-2 font-mono uppercase font-bold">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Administrator Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-10 py-3 focus:border-primary transition-colors"
                  placeholder="admin@system.local"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Authentication Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10 py-3 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center text-sm mt-2 hover:opacity-90 transition-opacity font-bold uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate Credentials'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            No administrator credentials?{' '}
            <Link to="/admin/signup" className="text-primary font-semibold hover:underline">
              Request access here
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            Are you a staffing vendor?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Agency Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
