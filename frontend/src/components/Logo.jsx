/**
 * Logo.jsx — Reusable VMS brand logo component
 * Props:
 *   size     — 'sm' | 'md' | 'lg'
 *   subtitle — string shown below wordmark (e.g. "Agency Portal")
 *   variant  — 'light' | 'dark'
 */

const sizes = {
  sm: { mark: 32, wordmark: 18, subtitle: 9, gap: 10 },
  md: { mark: 40, wordmark: 22, subtitle: 10, gap: 12 },
  lg: { mark: 56, wordmark: 30, subtitle: 12, gap: 14 },
};

export default function Logo({ size = 'md', subtitle = '', variant = 'light' }) {
  const s = sizes[size] ?? sizes.md;

  // Color tokens — swap for dark variant
  const primaryColor  = variant === 'dark' ? '#f5c9be' : 'oklch(0.465 0.147 24.9)';
  const foreColor     = variant === 'dark' ? '#f0ece6'  : 'oklch(0.218 0 0)';
  const mutedColor    = variant === 'dark' ? 'rgba(245,201,190,0.65)' : 'oklch(0.444 0.0096 73.6)';
  const accentStroke  = variant === 'dark' ? 'rgba(245,201,190,0.25)' : 'rgba(139,58,42,0.18)';

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: s.gap, userSelect: 'none' }}
      aria-label="VMS — Vendor Management System"
    >
      {/* ── Geometric SVG Mark ─────────────────────────────────────────── */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer hexagonal badge */}
        <polygon
          points="28,2 52,15 52,41 28,54 4,41 4,15"
          fill={primaryColor}
          opacity="0.12"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        {/* Inner accent ring */}
        <polygon
          points="28,8 47,19 47,37 28,48 9,37 9,19"
          fill="none"
          stroke={accentStroke}
          strokeWidth="1"
        />

        {/* V-shape — left ascending bar */}
        <path
          d="M14 14 L24 42"
          stroke={primaryColor}
          strokeWidth="5"
          strokeLinecap="square"
        />

        {/* V-shape — right ascending bar */}
        <path
          d="M28 42 L42 14"
          stroke={primaryColor}
          strokeWidth="5"
          strokeLinecap="square"
        />

        {/* Horizontal connector — the bridge */}
        <path
          d="M14 14 L42 14"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="square"
          opacity="0.55"
        />

        {/* Center diamond accent */}
        <rect
          x="25"
          y="25"
          width="6"
          height="6"
          transform="rotate(45 28 28)"
          fill={primaryColor}
          opacity="0.9"
        />
      </svg>

      {/* ── Wordmark + Subtitle ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 800,
            fontSize: s.wordmark,
            color: foreColor,
            letterSpacing: '0.06em',
            lineHeight: 1.1,
          }}
        >
          VMS
        </span>

        {subtitle && (
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: s.subtitle,
              color: mutedColor,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
