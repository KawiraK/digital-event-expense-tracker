import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvents, deleteEvent } from '../api/events'

export default function EventListPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getEvents()
      .then(res => setEvents(res.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch {
      alert('Failed to delete event.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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
        {(user.role === 'finance_manager' || user.role === 'admin') && (
          <>
            <button style={styles.navBtn} onClick={() => navigate('/alerts')}>Alerts</button>
            <button style={styles.navBtn} onClick={() => navigate('/reports')}>Reports</button>
          </>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>All Events</h2>
          {(user.role === 'organizer' || user.role === 'admin') && (
            <button style={styles.addBtn} onClick={() => navigate('/events/new')}>+ New Event</button>
          )}
        </div>

        {loading && <p style={styles.empty}>Loading events...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!loading && events.length === 0 && (
          <p style={styles.empty}>No events yet. Create your first event.</p>
        )}

        {events.map(event => (
          <div key={event.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.eventName}>{event.name}</h3>
                <p style={styles.eventDates}>{event.start_date} → {event.end_date}</p>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.viewBtn} onClick={() => navigate(`/events/${event.id}`)}>View</button>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    <button style={styles.editBtn} onClick={() => navigate(`/events/${event.id}/edit`)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(event.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>

            <div style={styles.budgetRow}>
              <span style={styles.budgetLabel}>Budget: <strong>KSh {parseFloat(event.total_budget).toLocaleString()}</strong></span>
              <span style={styles.budgetLabel}>Spent: <strong>KSh {parseFloat(event.total_spent).toLocaleString()}</strong></span>
              <span style={styles.budgetLabel}>Remaining: <strong>KSh {parseFloat(event.remaining_budget).toLocaleString()}</strong></span>
            </div>

            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${Math.min(parseFloat(event.spend_ratio), 100)}%`,
                backgroundColor: parseFloat(event.spend_ratio) >= 90 ? '#ef4444'
                  : parseFloat(event.spend_ratio) >= 75 ? '#f97316' : '#22c55e'
              }} />
            </div>
            <p style={styles.progressText}>{parseFloat(event.spend_ratio).toFixed(1)}% of budget used</p>
          </div>
        ))}
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
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', padding: '40px' },
  errorText: { color: '#cc0000', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  eventName: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  eventDates: { margin: 0, fontSize: '13px', color: '#888' },
  cardActions: { display: 'flex', gap: '8px' },
  viewBtn: { backgroundColor: '#ede9fe', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  editBtn: { backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  budgetRow: { display: 'flex', gap: '24px', marginBottom: '10px', flexWrap: 'wrap' },
  budgetLabel: { fontSize: '13px', color: '#555' },
  progressBar: { height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  progressText: { margin: 0, fontSize: '12px', color: '#888' },
}