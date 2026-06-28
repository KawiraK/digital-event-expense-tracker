import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createExpense } from '../api/expenses'
import { getCategories } from '../api/categories'
import { getEvent } from '../api/events'
import AppLayout from '../components/layout/AppLayout'
import { IconArrowLeft } from '../components/ui/Icons'
import { T, ui, formatKES } from '../theme'

export default function ExpenseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    vendor_name: '', description: '', amount: '', category: '',
    incurred_at: new Date().toISOString().slice(0, 16),
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getEvent(id), getCategories()])
      .then(([eventRes, catRes]) => {
        setEvent(eventRes.data)
        setCategories(catRes.data)
      })
      .catch(() => setError('Failed to load data.'))
  }, [id])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

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
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to save expense.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Add Expense" subtitle={event ? `For ${event.name}` : 'Record a new expense'}>
      <button onClick={() => navigate(`/events/${id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: T.muted, fontSize: 14, cursor: 'pointer', marginBottom: 18 }}>
        <IconArrowLeft size={16} color={T.muted} /> Back to event
      </button>

      <div style={{ maxWidth: 640 }}>
        <div style={{ ...ui.card, padding: 26 }}>
          {event && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.blueSoft, borderRadius: 12, padding: '12px 16px', marginBottom: 22 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.blueDark }}>{event.name}</span>
              <span style={{ fontSize: 13, color: T.blueDark }}>Budget: {formatKES(event.total_budget)}</span>
            </div>
          )}

          {error && <div style={errBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={ui.label}>Expense / Vendor Name</label>
            <input style={ui.input} name="vendor_name" value={form.vendor_name} onChange={handleChange} placeholder="e.g. Royal Catering Ltd" disabled={loading} />

            <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={ui.label}>Category</label>
                <select style={ui.input} name="category" value={form.category} onChange={handleChange} disabled={loading}>
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={ui.label}>Amount (KES)</label>
                <input style={ui.input} type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="e.g. 15000" min="1" disabled={loading} />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={ui.label}>Date &amp; Time</label>
              <input style={ui.input} type="datetime-local" name="incurred_at" value={form.incurred_at} onChange={handleChange} disabled={loading} />
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={ui.label}>Description</label>
              <textarea style={{ ...ui.input, minHeight: 84, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="Optional details about this expense" rows={3} disabled={loading} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 26 }}>
              <button type="button" style={ui.ghostBtn} onClick={() => navigate(`/events/${id}`)} disabled={loading}>Cancel</button>
              <button type="submit" style={{ ...ui.primaryBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Saving…' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}

const errBox = { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 18, fontSize: 14, fontWeight: 500 }
