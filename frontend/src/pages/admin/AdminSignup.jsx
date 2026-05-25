import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ShieldAlert, ClipboardList, Zap, Globe2 } from 'lucide-react';
import adminApi from '../../api/adminApi';
import Logo from '../../components/Logo';

// ── Left: Branded Panel Features ─────────────────────────────────────────────
const PANEL_FEATURES = [
  {
    icon: ClipboardList,
    title: 'System Administration',
    desc: 'Establish standard and dynamic requirement patterns across dates.',
  },
  {
    icon: Zap,
    title: 'Roster Coordination',
    desc: 'Control dispatch quotas and handle bouncer/marshal allocations.',
  },
  {
    icon: Globe2,
    title: 'Vendor Quotients',
    desc: 'Supervise agency submissions and track contractor rates.',
  },
];

/* ── Helper components defined OUTSIDE the main component ───────────────── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const IconInput = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Icon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
    </div>
    <input className="input-field pl-10 py-3 focus:border-primary transition-colors" {...props} />
  </div>
);

export default function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await adminApi.post('/admin/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans">

      {/* ── Left: Dark Branded Panel (desktop only) ───────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[34%] bg-[#111827] flex-col justify-between p-10 xl:p-12 relative overflow-hidden">
        {/* BG accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 bg-primary" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10 bg-primary" style={{ background: 'rgba(255,255,255,0.20)' }} />
        </div>

        <div className="relative z-10">
          <Logo subtitle="Admin Console" size="md" variant="dark" />
        </div>

        <div className="relative z-10 my-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/10 mb-4 rounded-none text-xs font-black uppercase tracking-widest text-primary">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Create Credentials</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            Establish System<br />Admin Privileges
          </h2>
          <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-xs font-medium">
            Register your administrator profile to begin orchestrating requirement matrices and dispatch pools.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {PANEL_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
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

      {/* ── Right: Admin Registration Form ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-6 sm:px-10 lg:px-14 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo subtitle="Admin Console" size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Request Admin Access
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Complete the credentials form below to register your administrator account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 text-sm mb-6 border-2 border-destructive flex items-start gap-2 font-mono uppercase font-bold">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <Field label="Full Administrator Name">
              <IconInput
                icon={User}
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </Field>

            {/* Email Address */}
            <Field label="Admin Email address">
              <IconInput
                icon={Mail}
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@system.local"
              />
            </Field>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Secret Password">
                <IconInput
                  icon={Lock}
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Field>

              <Field label="Confirm Secret Password">
                <IconInput
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center text-sm mt-4 hover:opacity-90 transition-opacity font-bold uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request System Access'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have admin access?{' '}
            <Link to="/admin/login" className="text-primary font-semibold hover:underline">
              Sign in here
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            Are you a staffing vendor?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register Agency
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
