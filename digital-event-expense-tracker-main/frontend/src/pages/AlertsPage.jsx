import { useEffect, useState } from 'react'
import { getAlerts, resolveAlert } from '../api/alerts'
import AppLayout from '../components/layout/AppLayout'
import { IconWarn, IconCheck } from '../components/ui/Icons'
import { T, ui } from '../theme'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAlerts()
      .then(res => setAlerts(res.data))
      .catch(() => setError('Failed to load alerts.'))
      .finally(() => setLoading(false))
  }, [])

  const handleResolve = async (id) => {
    try {
      const res = await resolveAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? res.data : a))
    } catch {
      alert('Failed to resolve alert.')
    }
  }

  const severity = (threshold) => {
    const t = parseFloat(threshold)
    if (t >= 100) return { bg: T.redSoft, fg: T.red }
    if (t >= 75) return { bg: T.orangeSoft, fg: '#B57417' }
    return { bg: T.blueSoft, fg: T.blueDark }
  }

  const fmt = (d) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const unresolved = alerts.filter(a => !a.is_resolved)
  const resolved = alerts.filter(a => a.is_resolved)

  const AlertRow = ({ alert, isResolved }) => {
    const sev = isResolved ? { bg: T.greenSoft, fg: '#03986F' } : severity(alert.threshold)
    return (
      <div style={{ ...ui.card, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, borderLeft: `4px solid ${sev.fg}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: sev.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isResolved ? <IconCheck size={20} color={sev.fg} /> : <IconWarn size={20} color={sev.fg} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: isResolved ? T.muted : T.ink }}>{alert.message}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: T.muted }}>
            Threshold {parseFloat(alert.threshold).toFixed(0)}% · {fmt(alert.triggered_at)}
          </p>
        </div>
        {!isResolved && (
          <button onClick={() => handleResolve(alert.id)} style={{ ...ui.ghostBtn, padding: '8px 14px', fontSize: 13, flexShrink: 0 }}>
            Mark resolved
          </button>
        )}
      </div>
    )
  }

  return (
    <AppLayout title="Budget Alerts" subtitle="Triggered automatically when an event reaches 50%, 75%, 90% or 100% of its budget.">
      {loading && <p style={{ color: T.muted }}>Loading alerts…</p>}
      {error && <p style={{ color: T.red }}>{error}</p>}

      {!loading && alerts.length === 0 && (
        <div style={{ ...ui.card, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <IconCheck size={28} color="#03986F" />
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, color: T.ink, margin: 0 }}>No alerts yet</p>
          <p style={{ color: T.muted, margin: '8px 0 0' }}>You&apos;re within budget across all events.</p>
        </div>
      )}

      {unresolved.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ ...ui.sectionTitle, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            Active <span style={ui.pill('red')}>{unresolved.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {unresolved.map(a => <AlertRow key={a.id} alert={a} isResolved={false} />)}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 style={{ ...ui.sectionTitle, marginBottom: 14 }}>Resolved</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {resolved.map(a => <AlertRow key={a.id} alert={a} isResolved={true} />)}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
