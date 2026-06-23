import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCategories, createCategory, deleteCategory } from '../api/categories'

const CATEGORY_CHOICES = ['venue', 'catering', 'decoration', 'transport', 'entertainment', 'contingency']

export default function CategoriesPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', default_budget: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(() => setError('Failed to load categories.'))
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name) { setError('Please select a category name.'); return }
    if (!form.default_budget || parseFloat(form.default_budget) < 0) {
      setError('Please enter a valid default budget.')
      return
    }

    const exists = categories.find(c => c.name === form.name)
    if (exists) { setError(`Category "${form.name}" already exists.`); return }

    setLoading(true)
    try {
      const res = await createCategory(form)
      setCategories(prev => [...prev, res.data])
      setForm({ name: '', default_budget: '' })
      setSuccess(`Category "${res.data.name}" created successfully.`)
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Failed to create category.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Failed to delete category. It may be in use by an expense.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const existingNames = categories.map(c => c.name)
  const availableChoices = CATEGORY_CHOICES.filter(c => !existingNames.includes(c))

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

        {/* Create Category Form */}
        <div style={styles.card}>
          <h2 style={styles.title}>Add Category</h2>
          <p style={styles.subtitle}>
            Categories group your expenses. Your backend supports exactly 6 types.
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          {availableChoices.length === 0 ? (
            <p style={styles.allAdded}>All 6 categories have been added.</p>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Category Name *</label>
                  <select
                    style={styles.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">-- Select category --</option>
                    {availableChoices.map(choice => (
                      <option key={choice} value={choice}>
                        {choice.charAt(0).toUpperCase() + choice.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Default Budget (KSh) *</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="default_budget"
                    value={form.default_budget}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div style={styles.fieldBtn}>
                  <label style={{ ...styles.label, color: 'transparent' }}>.</label>
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Categories List */}
        <div style={styles.card}>
          <h2 style={styles.title}>Existing Categories ({categories.length}/6)</h2>
          {categories.length === 0 ? (
            <p style={styles.empty}>No categories yet. Add one above.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Default Budget</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={styles.tr}>
                    <td style={styles.td}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </td>
                    <td style={styles.td}>KSh {parseFloat(cat.default_budget).toLocaleString()}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(cat.id, cat.name)}
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
  header: { backgroundColor: '#1a1a2e', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  headerSub: { margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid #aaa', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  nav: { backgroundColor: '#16213e', padding: '0 32px', display: 'flex', gap: '4px' },
  navBtn: { backgroundColor: 'transparent', border: 'none', color: '#ccc', padding: '14px 18px', cursor: 'pointer', fontSize: '14px' },
  content: { padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  title: { margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  subtitle: { margin: '0 0 16px 0', fontSize: '13px', color: '#888' },
  allAdded: { color: '#22c55e', fontWeight: '600', fontSize: '14px' },
  error: { backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successMsg: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' },
  fieldBtn: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  submitBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  empty: { textAlign: 'center', color: '#888', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '13px', color: '#888', borderBottom: '1px solid #eee', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
}