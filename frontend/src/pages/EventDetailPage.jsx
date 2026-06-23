import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvent, deleteEvent } from '../api/events'
import { deleteExpense } from '../api/expenses'

export default function EventDetailPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getEvent(id)
      .then(res => setEvent(res.data))
      .catch(() => setError('Failed to load event.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDeleteEvent = async () => {
    if (!window.confirm('Delete this event and all its expenses?')) return
    try {
      await deleteEvent(id)
      navigate('/events')
    } catch {
      alert('Failed to delete event.')
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteExpense(expenseId)
      setEvent(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== expenseId)
      }))
    } catch {
      alert('Failed to delete expense.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) return <div style={styles.loading}>Loading event...</div>
  if (error) return <div style={styles.loading}>{error}</div>
  if (!event) return null

  const spendRatio = parseFloat(event.spend_ratio)

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

        {/* Event Header Card */}
        <div style={styles.eventCard}>
          <div style={styles.eventTop}>
            <div>
              <h2 style={styles.eventName}>{event.name}</h2>
              <p style={styles.eventDesc}>{event.description || 'No description provided.'}</p>
              <p style={styles.eventDates}>{event.start_date} → {event.end_date}</p>
            </div>
            <div style={styles.eventActions}>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <>
                  <button style={styles.editBtn} onClick={() => navigate(`/events/${id}/edit`)}>Edit Event</button>
                  <button style={styles.deleteBtn} onClick={handleDeleteEvent}>Delete Event</button>
                </>
              )}
            </div>
          </div>

          {/* Budget Summary */}
          <div style={styles.budgetGrid}>
            <div style={styles.budgetItem}>
              <p style={styles.budgetLabel}>Total Budget</p>
              <p style={styles.budgetValue}>KSh {parseFloat(event.total_budget).toLocaleString()}</p>
            </div>
            <div style={styles.budgetItem}>
              <p style={styles.budgetLabel}>Total Spent</p>
              <p style={styles.budgetValue}>KSh {parseFloat(event.total_spent).toLocaleString()}</p>
            </div>
            <div style={styles.budgetItem}>
              <p style={styles.budgetLabel}>Remaining</p>
              <p style={{ ...styles.budgetValue, color: parseFloat(event.remaining_budget) < 0 ? '#ef4444' : '#22c55e' }}>
                KSh {parseFloat(event.remaining_budget).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressWrap}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${Math.min(spendRatio, 100)}%`,
                backgroundColor: spendRatio >= 90 ? '#ef4444' : spendRatio >= 75 ? '#f97316' : '#22c55e'
              }} />
            </div>
            <span style={styles.progressText}>{spendRatio.toFixed(1)}% of budget used</span>
          </div>
        </div>

        {/* Expenses Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Expenses ({event.expenses?.length || 0})</h3>
            <button
              style={styles.addBtn}
              onClick={() => navigate(`/events/${id}/expenses/new`)}
            >
              + Add Expense
            </button>
          </div>

          {!event.expenses || event.expenses.length === 0 ? (
            <p style={styles.empty}>No expenses recorded yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Vendor</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {event.expenses.map(expense => (
                  <tr key={expense.id} style={styles.tr}>
                    <td style={styles.td}>{expense.vendor_name}</td>
                    <td style={styles.td}>{expense.category}</td>
                    <td style={styles.td}>{expense.description || '—'}</td>
                    <td style={styles.td}>KSh {parseFloat(expense.amount).toLocaleString()}</td>
                    <td style={styles.td}>{new Date(expense.incurred_at).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtnSm}
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: '40px' },
  loading: { padding: '40px', textAlign: 'center', color: '#666' },
  header: { backgroundColor: '#1a1a2e', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  headerSub: { margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #aaa', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { backgroundColor: '#16213e', padding: '0 32px', display: 'flex', gap: '4px' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: '#ccc', padding: '14px 18px', cursor: 'pointer', fontSize: '14px' },
  content: { padding: '24px 32px' },
  eventCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  eventTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  eventName: { margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#1a1a2e' },
  eventDesc: { margin: '0 0 4px 0', fontSize: '14px', color: '#666' },
  eventDates: { margin: 0, fontSize: '13px', color: '#888' },
  eventActions: { display: 'flex', gap: '8px' },
  editBtn: { backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  budgetGrid: { display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
  budgetItem: { flex: 1, minWidth: '140px', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '14px 18px' },
  budgetLabel: { margin: '0 0 4px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: '600' },
  budgetValue: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
  progressBar: { flex: 1, height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s' },
  progressText: { fontSize: '13px', color: '#555', whiteSpace: 'nowrap' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#888', borderBottom: '1px solid #eee', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  deleteBtnSm: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
}