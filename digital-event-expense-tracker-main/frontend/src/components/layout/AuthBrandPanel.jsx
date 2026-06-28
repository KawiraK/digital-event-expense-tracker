import { T } from '../../theme'

// Left-hand brand panel shown on the login and register screens.
export default function AuthBrandPanel() {
  return (
    <div className="auth-brand" style={{
      flex: 1, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${T.navy} 0%, #16245C 55%, ${T.blueDark} 130%)`,
      color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '56px 60px',
    }}>
      {/* ambient shapes */}
      <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(37,99,235,0.35)', filter: 'blur(10px)', top: -120, right: -90 }} />
      <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(106,210,255,0.18)', filter: 'blur(6px)', bottom: -70, left: -50 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>E</div>
          <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>Digital Event<br /><span style={{ color: '#A3AED0', fontWeight: 500, fontSize: 14 }}>Expense Tracker</span></div>
        </div>

        {/* decorative illustration */}
        <svg width="280" height="170" viewBox="0 0 280 170" fill="none" style={{ marginBottom: 36 }}>
          <rect x="8" y="40" width="150" height="120" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" />
          <rect x="26" y="60" width="60" height="8" rx="4" fill="#6AD2FF" />
          <rect x="26" y="78" width="100" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
          <rect x="26" y="92" width="80" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
          <rect x="26" y="118" width="28" height="30" rx="4" fill="#2563EB" />
          <rect x="60" y="106" width="28" height="42" rx="4" fill="#05CD99" />
          <rect x="94" y="124" width="28" height="24" rx="4" fill="#FFB547" />
          <circle cx="212" cy="78" r="52" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
          <path d="M212 26 A52 52 0 0 1 258 102 L212 78 Z" fill="#2563EB" />
          <path d="M258 102 A52 52 0 0 1 176 110 L212 78 Z" fill="#05CD99" />
          <path d="M176 110 A52 52 0 0 1 212 26 L212 78 Z" fill="#FFB547" />
          <circle cx="212" cy="78" r="22" fill={T.navy} />
        </svg>

        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.15 }}>
          Plan, track and manage your event budgets with ease.
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 16, color: '#C9D2EC', maxWidth: 420, lineHeight: 1.55 }}>
          One place to set budgets, log expenses, watch spending against limits, and generate reports.
        </p>
      </div>
    </div>
  )
}
