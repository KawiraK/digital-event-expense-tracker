import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createEvent, getEvent, updateEvent } from '../api/events'

export default function EventFormPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    total_budget: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing) {
      getEvent(id)
        .then(res => {
          const e = res.data
          setForm({
            name: e.name,
            description: e.description || '',
            start_date: e.start_date,
            end_date: e.end_date,
            total_budget: e.total_budget,
          })
        })
        .catch(() => setError('Failed to load event.'))
    }
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Event name is required.'
    if (!form.start_date) return 'Start date is required.'
    if (!form.end_date) return 'End date is required.'
    if (form.end_date < form.start_date) return 'End date cannot be before start date.'
    if (!form.total_budget || parseFloat(form.total_budget) <= 0) return 'Budget must be greater than 0.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      if (isEditing) {
        await updateEvent(id, form)
      } else {
        await createEvent(form)
      }
      navigate('/events')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Failed to save event.'
      setError(msg)
    } finally {
      setLoading(false)
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
        <div style={styles.card}>
          <h2 style={styles.title}>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Event Name *</label>
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Annual Company Gala"
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows={3}
                disabled={loading}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Start Date *</label>
                <input
                  style={styles.input}
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>End Date *</label>
                <input
                  style={styles.input}
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Total Budget (KSh) *</label>
              <input
                style={styles.input}
                type="number"
                name="total_budget"
                value={form.total_budget}
                onChange={handleChange}
                placeholder="e.g. 500000"
                min="1"
                disabled={loading}
              />
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => navigate('/events')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
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
  content: { padding: '32px', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  error: { backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' },
  row: { display: 'flex', gap: '16px' },
  buttons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
}