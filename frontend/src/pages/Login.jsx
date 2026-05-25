import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, CheckCircle2, Users, BarChart3, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import Logo from '../components/Logo';

// ── Demo credentials ─────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'test@gmail.com';
const DEMO_PASSWORD = 'test';
const DEMO_TOKEN    = 'demo-static-token-bypass';
const DEMO_NAME     = 'Test Agency';

const FEATURES = [
  {
    icon: Users,
    title: 'Workforce Quotations',
    desc: 'Submit and track manpower quotations in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Allocation Visibility',
    desc: 'See how your workforce maps to open requirements.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Compliant',
    desc: 'GST-verified agencies with end-to-end data security.',
  },
  {
    icon: CheckCircle2,
    title: 'Instant Approvals',
    desc: 'Get notified the moment your submission is reviewed.',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ── Static demo bypass ────────────────────────────────────────────────────
    if (formData.email === DEMO_EMAIL && formData.password === DEMO_PASSWORD) {
      localStorage.setItem('token', DEMO_TOKEN);
      localStorage.setItem('agencyName', DEMO_NAME);
      setTimeout(() => navigate('/dashboard'), 500);
      return;
    }

    // ── Real API call ─────────────────────────────────────────────────────────
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('agencyName', response.data.agencyName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">

      {/* ── Left: Branded Panel (desktop only) ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle geometric background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.25)' }}
          />
          <div
            className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'rgba(255,255,255,0.20)' }}
          />
          {/* Hex grid accent */}
          <svg
            className="absolute right-0 top-1/3 opacity-5"
            width="220"
            height="300"
            viewBox="0 0 220 300"
            fill="none"
          >
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
          <Logo subtitle="Agency Portal" size="md" variant="dark" />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-10">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Manage your<br />workforce quotations<br />with confidence.
          </h2>
          <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-xs">
            The VMS Agency Portal gives your team a single place to submit, track, and manage all manpower requirements.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Login Form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo subtitle="Agency Portal" size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Sign in to your agency account to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 text-sm mb-6 border-2 border-destructive flex items-start gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email address
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
                  placeholder="test@gmail.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Password
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
              className="btn-primary w-full py-3 flex items-center justify-center text-sm mt-2 hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in to Dashboard'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an agency account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            Are you a system administrator?{' '}
            <Link to="/admin/login" className="text-primary font-semibold hover:underline">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
