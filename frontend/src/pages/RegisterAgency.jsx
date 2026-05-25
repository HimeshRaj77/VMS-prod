import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Building, User, Mail, Phone, Lock, FileDigit, MapPin,
  ClipboardList, Zap, Globe2,
} from 'lucide-react';
import api from '../api/axios';
import Logo from '../components/Logo';

/* ── Panel feature list ─────────────────────────────────────────────────── */
const PANEL_FEATURES = [
  {
    icon: ClipboardList,
    title: 'Streamlined Onboarding',
    desc: 'Register once and start submitting quotations immediately.',
  },
  {
    icon: Zap,
    title: 'Real-Time Tracking',
    desc: 'Monitor the status of every requirement allocation.',
  },
  {
    icon: Globe2,
    title: 'GST-Verified Network',
    desc: 'Join a trusted network of verified staffing agencies.',
  },
];

/* ── Helper components defined OUTSIDE the main component ───────────────── */
/* Defining them inside would recreate them on every render, losing input focus */

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

/* ── Main component ─────────────────────────────────────────────────────── */
export default function RegisterAgency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    agencyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('agencyName', response.data.agencyName);
      navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">

      {/* ── Left: Branded Panel (desktop only) ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[34%] bg-primary flex-col justify-between p-10 xl:p-12 relative overflow-hidden">
        {/* BG accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.20)' }} />
        </div>

        <div className="relative z-10">
          <Logo subtitle="Agency Portal" size="md" variant="dark" />
        </div>

        <div className="relative z-10 my-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            Join the VMS<br />Agency Network
          </h2>
          <p className="mt-3 text-white/70 text-sm leading-relaxed max-w-xs">
            Register your staffing agency and start collaborating with clients on open manpower requirements.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {PANEL_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
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

      {/* ── Right: Registration Form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-6 sm:px-10 lg:px-14 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo subtitle="Agency Portal" size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Register your Agency
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Fill in the details below to join the platform.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 text-sm mb-6 border-2 border-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section: Company Details ─────────────────────────────── */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b-2 border-border">
                Company Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Agency Name">
                  <IconInput icon={Building} required name="agencyName" value={formData.agencyName} onChange={handleChange} placeholder="Acme Staffing Ltd" />
                </Field>
                <Field label="Contact Person">
                  <IconInput icon={User} required name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="John Doe" />
                </Field>
                <Field label="GST Number">
                  <IconInput icon={FileDigit} required name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN123456789" />
                </Field>
                <Field label="Phone Number">
                  <IconInput icon={Phone} required name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </Field>
              </div>
            </div>

            {/* ── Section: Contact Info ────────────────────────────────── */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b-2 border-border">
                Contact Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address">
                  <IconInput icon={Mail} required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@agency.com" />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Full Address">
                    <div className="relative group">
                      <div className="absolute top-3 left-3.5 pointer-events-none">
                        <MapPin className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <textarea
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className="input-field pl-10 py-3 resize-none focus:border-primary transition-colors"
                        placeholder="123 Business Avenue, Industrial Area..."
                      />
                    </div>
                  </Field>
                </div>

                <Field label="City">
                  <input required name="city" value={formData.city} onChange={handleChange} className="input-field py-3 focus:border-primary transition-colors" placeholder="Mumbai" />
                </Field>
                <Field label="State">
                  <input required name="state" value={formData.state} onChange={handleChange} className="input-field py-3 focus:border-primary transition-colors" placeholder="Maharashtra" />
                </Field>
              </div>
            </div>

            {/* ── Section: Security ────────────────────────────────────── */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b-2 border-border">
                Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Password">
                  <IconInput icon={Lock} required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                </Field>
                <Field label="Confirm Password">
                  <IconInput icon={Lock} required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in here
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            Are you a system administrator?{' '}
            <Link to="/admin/signup" className="text-primary font-semibold hover:underline">
              Request Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
