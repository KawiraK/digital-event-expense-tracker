import { T } from '../../theme'

// A stat tile: small icon chip on the left, label + value on the right.
export default function StatCard({ icon: Icon, label, value, accent = T.blue, accentBg = T.blueSoft, footnote }) {
  return (
    <div style={{
      background: T.card,
      borderRadius: T.radius,
      border: `1px solid ${T.line}`,
      boxShadow: T.shadowSm,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: 1,
      minWidth: 200,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {Icon && <Icon size={22} color={accent} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: T.muted, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: 22, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
        {footnote && <p style={{ margin: '2px 0 0 0', fontSize: 12, color: T.muted }}>{footnote}</p>}
      </div>
    </div>
  )
}
