import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, FileText, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const agencyName = localStorage.getItem('agencyName') || 'Agency';
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive initials for avatar circle
  const initials = agencyName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('agencyName');
    setMobileOpen(false);
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'My Quotation', icon: LayoutDashboard },
        { to: '/upload',    label: 'Upload PDF',   icon: FileText },
      ]
    : [
        { to: '/login',    label: 'Login',           icon: User },
        { to: '/register', label: 'Register Agency', icon: FileText },
      ];

  return (
    <nav className="fixed top-0 w-full bg-card/90 backdrop-blur-xl border-b-2 border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* ── Brand ──────────────────────────────────────────────── */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center focus:outline-none"
            aria-label="Go to home"
          >
            <Logo subtitle="Agency Portal" size="sm" />
          </button>

          {/* ── Desktop Nav ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary font-medium transition-colors text-sm px-3 py-2 hover:bg-muted"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l-2 border-border">
                {/* Agency Avatar */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {initials || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground hidden lg:block">
                    {agencyName}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Register CTA when unauthenticated */}
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary text-sm px-5 py-2 ml-2">
                Register Agency
              </Link>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────────────────────── */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-2 border-border"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Slide-Down Menu ──────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t-2 border-border bg-card ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-muted-foreground hover:text-primary font-medium transition-colors text-sm px-3 py-3 hover:bg-muted border-b border-border last:border-b-0"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {isAuthenticated && (
            <div className="pt-3 mt-1 border-t-2 border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {initials || <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-semibold text-foreground">{agencyName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-sm text-center block"
              >
                Register Agency
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
