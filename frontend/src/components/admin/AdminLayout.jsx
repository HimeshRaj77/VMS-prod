import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Grid, ClipboardList, LogOut,
  ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';
import Logo from '../Logo';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Roster Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Requirements',     path: '/admin/requirements', icon: ClipboardList },
    { label: 'Allocation Matrix', path: '/admin/allocation', icon: Grid },
  ];

  const adminName = localStorage.getItem('adminName') || 'System Admin';

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/admin/dashboard' && location.pathname === '/dashboard');

  /* ── Shared: Nav item button ──────────────────────────────────────────── */
  const NavItem = ({ item, collapsed }) => {
    const { label, path, icon: Icon } = item;
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center py-3 transition-all cursor-pointer font-bold text-xs uppercase border-2 text-left relative group
          ${active
            ? 'bg-primary/5 text-primary border-primary hover:bg-primary/10'
            : 'bg-card text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'
          }
          ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}
        `}
      >
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
        {!collapsed && <span className="tracking-wide">{label}</span>}

        {/* Collapsed tooltip */}
        {collapsed && (
          <div className="absolute left-[68px] bg-card border-2 border-border px-3 py-1.5 text-[9px] uppercase tracking-wider text-foreground font-bold shadow opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all whitespace-nowrap z-50">
            {label}
          </div>
        )}
      </button>
    );
  };

  /* ── Shared: Footer (logout + name) ───────────────────────────────────── */
  const SidebarFooter = ({ collapsed }) => (
    <div className="border-t-2 border-border p-3 space-y-3 bg-muted/40">
      {!collapsed && (
        <div className="px-2 py-1 leading-none text-left overflow-hidden">
          <span className="text-[8px] font-bold text-muted-foreground uppercase block tracking-wider">Authenticated As</span>
          <span className="font-extrabold text-[10px] uppercase text-foreground block truncate mt-1">{adminName}</span>
        </div>
      )}
      <button
        onClick={handleLogout}
        title={collapsed ? 'Sign Out' : undefined}
        className={`w-full flex items-center py-2.5 border-2 border-border bg-card text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer font-bold text-xs uppercase group relative
          ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}
        `}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {!collapsed && <span className="tracking-wide">Sign Out</span>}
        {collapsed && (
          <div className="absolute left-[68px] bg-card border-2 border-destructive px-3 py-1.5 text-[9px] uppercase tracking-wider text-destructive font-bold shadow opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 pointer-events-none transition-all whitespace-nowrap z-50">
            Sign Out
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans antialiased">

      {/* ══ DESKTOP SIDEBAR (lg+) ═════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex fixed top-0 bottom-0 left-0 bg-card border-r-2 border-border flex-col justify-between z-30 select-none shadow-sm"
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b-2 border-border shrink-0">
            <div className="flex items-center overflow-hidden">
              {!isCollapsed && <Logo subtitle="Admin Console" size="sm" />}
              {isCollapsed && (
                /* Mini mark when collapsed */
                <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
                  <polygon points="28,2 52,15 52,41 28,54 4,41 4,15" fill="oklch(0.465 0.147 24.9)" opacity="0.15" stroke="oklch(0.465 0.147 24.9)" strokeWidth="1.5" />
                  <path d="M14 14 L24 42" stroke="oklch(0.465 0.147 24.9)" strokeWidth="5" strokeLinecap="square" />
                  <path d="M28 42 L42 14" stroke="oklch(0.465 0.147 24.9)" strokeWidth="5" strokeLinecap="square" />
                  <path d="M14 14 L42 14" stroke="oklch(0.465 0.147 24.9)" strokeWidth="3" strokeLinecap="square" opacity="0.55" />
                </svg>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-full py-2.5 mb-4 hover:bg-muted border-2 border-border text-muted-foreground hover:text-foreground transition-all flex items-center justify-center cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </nav>
        </div>

        <SidebarFooter collapsed={isCollapsed} />
      </motion.aside>

      {/* ══ MOBILE TOP BAR (<lg) ════════════════════════════════════════════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b-2 border-border flex items-center justify-between px-4 z-40">
        <Logo subtitle="Admin Console" size="sm" />
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted border-2 border-border transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ══ MOBILE DRAWER ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-card border-r-2 border-border flex flex-col justify-between z-50 select-none shadow-xl"
            >
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Drawer header */}
                <div className="h-14 flex items-center justify-between px-4 border-b-2 border-border shrink-0">
                  <Logo subtitle="Admin Console" size="sm" />
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                    aria-label="Close navigation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto custom-scrollbar">
                  {navItems.map((item) => (
                    <NavItem key={item.path} item={item} collapsed={false} />
                  ))}
                </nav>
              </div>

              <SidebarFooter collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main
          className="flex-grow min-h-screen p-4 sm:p-6 lg:p-8 transition-all duration-200 ease-in-out pt-20 lg:pt-8"
          style={{ paddingLeft: undefined }}
        >
          {/* Desktop sidebar offset applied via inline style on lg */}
          <div
            className="hidden lg:block"
            style={{ display: 'none' }}
          />
          {children}
        </main>
      </div>

      {/* Desktop sidebar offset — spacer div approach */}
      <style>{`
        @media (min-width: 1024px) {
          main {
            padding-left: calc(${isCollapsed ? 76 : 260}px + 2rem) !important;
          }
        }
      `}</style>
    </div>
  );
}
