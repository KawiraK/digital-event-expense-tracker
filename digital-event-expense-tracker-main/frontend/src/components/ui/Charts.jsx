// Lightweight, dependency-free SVG charts.
// No external chart library required.
import { T, formatKES } from '../../theme'

// ---- Donut chart -------------------------------------------------------
// data: [{ label, value, color }]
export function DonutChart({ data = [], size = 200, thickness = 26, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + Number(d.value || 0), 0)
  const radius = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * radius

  let offset = 0
  const segments = total > 0 ? data.map((d) => {
    const frac = Number(d.value || 0) / total
    const seg = {
      color: d.color,
      dash: frac * circ,
      gap: circ - frac * circ,
      rotation: (offset / total) * 360 - 90,
    }
    offset += Number(d.value || 0)
    return seg
  }) : []

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={T.line} strokeWidth={thickness} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeLinecap="butt"
              transform={`rotate(${s.rotation} ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{centerLabel || 'Total'}</span>
          <span style={{ fontSize: 17, color: T.ink, fontWeight: 700 }}>{centerValue}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 150 }}>
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((Number(d.value || 0) / total) * 100) : 0
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.body }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block' }} />
                {d.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{pct}%</span>
            </div>
          )
        })}
        {data.length === 0 && <span style={{ fontSize: 13, color: T.muted }}>No data yet</span>}
      </div>
    </div>
  )
}

// ---- Budget vs Spent horizontal bars -----------------------------------
// data: [{ label, budget, spent }]
export function BudgetBars({ data = [] }) {
  const max = Math.max(1, ...data.map(d => Math.max(Number(d.budget || 0), Number(d.spent || 0))))
  if (data.length === 0) {
    return <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>No events to chart yet.</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {data.map((d, i) => {
        const budgetW = (Number(d.budget || 0) / max) * 100
        const spentW = (Number(d.spent || 0) / max) * 100
        const over = Number(d.spent || 0) > Number(d.budget || 0)
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{d.label}</span>
              <span style={{ fontSize: 12, color: T.muted }}>{formatKES(d.spent)} / {formatKES(d.budget)}</span>
            </div>
            <div style={{ position: 'relative', height: 10, background: T.line, borderRadius: 999 }}>
              <div style={{ position: 'absolute', inset: 0, width: `${budgetW}%`, background: T.blueSoft, borderRadius: 999 }} />
              <div style={{ position: 'absolute', inset: 0, width: `${spentW}%`, background: over ? T.red : T.blue, borderRadius: 999 }} />
            </div>
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 18, marginTop: 4 }}>
        <Legend color={T.blue} label="Spent" />
        <Legend color={T.blueSoft} label="Budget" />
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.muted }}>
      <span style={{ width: 12, height: 12, borderRadius: 4, background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

// ---- Vertical bar chart -------------------------------------------------
// data: [{ label, value }]
export function BarChart({ data = [], height = 200, color = T.blue }) {
  const max = Math.max(1, ...data.map(d => Number(d.value || 0)))
  if (data.length === 0) {
    return <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>No data yet.</p>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = (Number(d.value || 0) / max) * (height - 28)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div title={formatKES(d.value)} style={{ width: '70%', maxWidth: 34, height: Math.max(4, h), background: color, borderRadius: 8, transition: 'height .3s' }} />
            <span style={{ fontSize: 11, color: T.muted }}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
