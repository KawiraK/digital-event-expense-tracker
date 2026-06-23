import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAlerts, resolveAlert } from '../api/alerts'

export default function AlertsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const unresolved = alerts.filter(a => !a.is_resolved)
  const resolved = alerts.filter(a => a.is_resolved)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Event Expense Tracker</h1>
          <p style={styles.headerSub}>Welcome back, <strong>{user.username}</strong> — {user.role}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button style={styles.navBtn} onClick={() => navigate('/events')}>Events</button>
        <button style={styles.navBtn} onClick={() => navigate('/categories')}>Categories</button>
        <button style={styles.navBtn} onClick={() => navigate('/alerts')}>Alerts</button>
        <button style={styles.navBtn} onClick={() => navigate('/reports')}>Reports</button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Budget Alerts</h2>
        <p style={styles.pageSubtitle}>
          Alerts are automatically triggered when an event reaches 50%, 75%, 90%, or 100% of its budget.
        </p>

        {loading && <p style={styles.empty}>Loading alerts...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Unresolved Alerts */}
        {unresolved.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Active Alerts
              <span style={styles.badge}>{unresolved.length}</span>
            </h3>
            {unresolved.map(alert => (
              <div key={alert.id} style={styles.alertCard}>
                <div style={styles.alertIcon}>⚠️</div>
                <div style={styles.alertBody}>
                  <p style={styles.alertMessage}>{alert.message}</p>
                  <p style={styles.alertMeta}>
                    Threshold: <strong>{parseFloat(alert.threshold).toFixed(0)}%</strong> —
                    Triggered: <strong>{new Date(alert.triggered_at).toLocaleString()}</strong>
                  </p>
                </div>
                <button
                  style={styles.resolveBtn}
                  onClick={() => handleResolve(alert.id)}
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Resolved Alerts */}
        {resolved.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Resolved Alerts</h3>
            {resolved.map(alert => (
              <div key={alert.id} style={styles.resolvedCard}>
                <div style={styles.alertIcon}>✅</div>
                <div style={styles.alertBody}>
                  <p style={styles.alertMessageResolved}>{alert.message}</p>
                  <p style={styles.alertMeta}>
                    Threshold: <strong>{parseFloat(alert.threshold).toFixed(0)}%</strong> —
                    Triggered: <strong>{new Date(alert.triggered_at).toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div style={styles.emptyCard}>
            <p style={styles.emptyTitle}>No alerts yet</p>
            <p style={styles.emptyText}>
              Alerts will appear here automatically when an event's spending crosses 50%, 75%, 90%, or 100% of its budget.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: '40px' },
  header: { backgroundColor: '#1a1a2e', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  headerSub: { margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #aaa', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { backgroundColor: '#16213e', padding: '0 32px', display: 'flex', gap: '4px' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: '#ccc', padding: '14px 18px', cursor: 'pointer', fontSize: '14px' },
  content: { padding: '24px 32px' },
  pageTitle: { margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#1a1a2e' },
  pageSubtitle: { margin: '0 0 24px 0', fontSize: '14px', color: '#888' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '13px', fontWeight: '700' },
  alertCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#fff8f0', border: '1px solid #fed7aa', borderRadius: '10px', marginBottom: '12px' },
  resolvedCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '12px' },
  alertIcon: { fontSize: '24px', marginTop: '2px' },
  alertBody: { flex: 1 },
  alertMessage: { margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: '#92400e' },
  alertMessageResolved: { margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: '#166534' },
  alertMeta: { margin: 0, fontSize: '13px', color: '#888' },
  resolveBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },
  emptyCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  emptyTitle: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  emptyText: { margin: 0, fontSize: '14px', color: '#888', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' },
  empty: { textAlign: 'center', color: '#888', padding: '40px' },
  errorText: { color: '#cc0000', textAlign: 'center' },
}