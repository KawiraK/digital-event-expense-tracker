import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvents } from '../api/events'
import { getExpenses } from '../api/expenses'
import { getAlerts } from '../api/alerts'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [expenses, setExpenses] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, expensesRes] = await Promise.all([
          getEvents(),
          getExpenses(),
        ])
        setEvents(eventsRes.data)
        setExpenses(expensesRes.data)

        if (user.role === 'finance_manager' || user.role === 'admin') {
          const alertsRes = await getAlerts()
          setAlerts(alertsRes.data)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const totalBudget = events.reduce((sum, e) => sum + parseFloat(e.total_budget || 0), 0)
  const totalSpent = events.reduce((sum, e) => sum + parseFloat(e.total_spent || 0), 0)
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Event Expense Tracker</h1>
          <p style={styles.headerSub}>Welcome back, <strong>{user.username}</strong> — {user.role}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Nav */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={() => navigate('/events')}>Events</button>
        <button style={styles.navBtn} onClick={() => navigate('/categories')}>Categories</button>
        {(user.role === 'finance_manager' || user.role === 'admin') && (
          <>
            <button style={styles.navBtn} onClick={() => navigate('/alerts')}>Alerts</button>
            <button style={styles.navBtn} onClick={() => navigate('/reports')}>Reports</button>
          </>
        )}
      </div>

      {/* Stat Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Events</p>
          <p style={styles.cardValue}>{events.length}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Expenses</p>
          <p style={styles.cardValue}>{expenses.length}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Budget</p>
          <p style={styles.cardValue}>KSh {totalBudget.toLocaleString()}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Spent</p>
          <p style={styles.cardValue}>KSh {totalSpent.toLocaleString()}</p>
        </div>
        {(user.role === 'finance_manager' || user.role === 'admin') && (
          <div style={{ ...styles.card, borderLeft: '4px solid #ef4444' }}>
            <p style={styles.cardLabel}>Unresolved Alerts</p>
            <p style={{ ...styles.cardValue, color: '#ef4444' }}>{unresolvedAlerts}</p>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Events</h2>
          {(user.role === 'organizer' || user.role === 'admin') && (
            <button style={styles.addBtn} onClick={() => navigate('/events/new')}>
              + New Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <p style={styles.empty}>No events found. Create your first event.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event Name</th>
                <th style={styles.th}>Budget</th>
                <th style={styles.th}>Spent</th>
                <th style={styles.th}>Remaining</th>
                <th style={styles.th}>Spend %</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map(event => (
                <tr key={event.id} style={styles.tr}>
                  <td style={styles.td}>{event.name}</td>
                  <td style={styles.td}>KSh {parseFloat(event.total_budget).toLocaleString()}</td>
                  <td style={styles.td}>KSh {parseFloat(event.total_spent).toLocaleString()}</td>
                  <td style={styles.td}>KSh {parseFloat(event.remaining_budget).toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${Math.min(parseFloat(event.spend_ratio), 100)}%`,
                        backgroundColor: parseFloat(event.spend_ratio) >= 90 ? '#ef4444'
                          : parseFloat(event.spend_ratio) >= 75 ? '#f97316' : '#22c55e'
                      }} />
                    </div>
                    <span style={styles.progressText}>{parseFloat(event.spend_ratio).toFixed(1)}%</span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.viewBtn} onClick={() => navigate(`/events/${event.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '0 0 40px 0' },
  loading: { padding: '40px', textAlign: 'center', color: '#666' },
  header: { backgroundColor: '#1a1a2e', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  headerSub: { margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #aaa', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { backgroundColor: '#16213e', padding: '0 32px', display: 'flex', gap: '4px' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: '#ccc', padding: '14px 18px', cursor: 'pointer', fontSize: '14px', borderBottom: '3px solid transparent' },
  cards: { display: 'flex', gap: '16px', padding: '24px 32px', flexWrap: 'wrap' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px 24px', flex: '1', minWidth: '160px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderLeft: '4px solid #4f46e5' },
  cardLabel: { margin: '0 0 8px 0', fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  cardValue: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1a1a2e' },
  section: { margin: '0 32px', backgroundColor: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  empty: { color: '#888', textAlign: 'center', padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#888', borderBottom: '1px solid #eee', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  progressBar: { height: '6px', backgroundColor: '#eee', borderRadius: '3px', width: '80px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  progressText: { fontSize: '12px', color: '#555' },
  viewBtn: { backgroundColor: '#ede9fe', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
}