import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createExpense } from '../api/expenses'
import { getCategories } from '../api/categories'
import { getEvent } from '../api/events'

export default function ExpenseFormPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    vendor_name: '',
    description: '',
    amount: '',
    category: '',
    incurred_at: new Date().toISOString().slice(0, 16),
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getEvent(id), getCategories()])
      .then(([eventRes, catRes]) => {
        console.log('Categories loaded:', catRes.data)
        setEvent(eventRes.data)
        setCategories(catRes.data)
      })
      .catch((err) => {
        console.log('Error:', err.response?.status, err.response?.data)
        setError('Failed to load data.')
      })
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    if (!form.vendor_name.trim()) return 'Vendor name is required.'
    if (!form.category) return 'Please select a category.'
    if (!form.amount || parseFloat(form.amount) <= 0) return 'Amount must be greater than 0.'
    if (!form.incurred_at) return 'Date is required.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      await createExpense({
        event: parseInt(id),
        category: parseInt(form.category),
        vendor_name: form.vendor_name,
        description: form.description,
        amount: form.amount,
        incurred_at: form.incurred_at,
      })
      navigate(`/events/${id}`)
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(' ')
        : 'Failed to save expense.'
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
          <h2 style={styles.title}>Add Expense</h2>
          {event && (
            <div style={styles.eventBadge}>
              Event: <strong>{event.name}</strong> — Budget: KSh {parseFloat(event.total_budget).toLocaleString()}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Vendor Name *</label>
              <input
                style={styles.input}
                name="vendor_name"
                value={form.vendor_name}
                onChange={handleChange}
                placeholder="e.g. Royal Catering Ltd"
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <select
                style={styles.input}
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select a category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional details about this expense"
                rows={3}
                disabled={loading}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Amount (KSh) *</label>
                <input
                  style={styles.input}
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  min="1"
                  disabled={loading}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date & Time *</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  name="incurred_at"
                  value={form.incurred_at}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => navigate(`/events/${id}`)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving...' : 'Add Expense'}
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
  title: { margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  eventBadge: { backgroundColor: '#ede9fe', color: '#4f46e5', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' },
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