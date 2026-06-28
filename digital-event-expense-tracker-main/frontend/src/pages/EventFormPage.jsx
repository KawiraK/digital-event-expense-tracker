import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEvent, getEvent, updateEvent } from '../api/events'
import AppLayout from '../components/layout/AppLayout'
import { IconCalendar } from '../components/ui/Icons'
import { T, ui, formatKES, formatDate } from '../theme'

export default function EventFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '', total_budget: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing) {
      getEvent(id)
        .then(res => {
          const e = res.data
          setForm({
            name: e.name, description: e.description || '',
            start_date: e.start_date, end_date: e.end_date, total_budget: e.total_budget,
          })
        })
        .catch(() => setError('Failed to load event.'))
    }
  }, [id])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

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
      if (isEditing) await updateEvent(id, form)
      else await createEvent(form)
      navigate('/events')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to save event.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout
      title={isEditing ? 'Edit Event' : 'Create New Event'}
      subtitle={<span style={{ color: T.muted }}>Events <span style={{ color: T.line }}>/</span> {isEditing ? 'Edit' : 'Create Event'}</span>}
    >
      <div className="form-preview-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 18 }}>
        {/* Form */}
        <div style={{ ...ui.card, padding: 26 }}>
          {error && <div style={errBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={ui.label}>Event Name</label>
            <input style={ui.input} name="name" value={form.name} onChange={handleChange} placeholder="Enter event name" disabled={loading} />

            <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={ui.label}>Start Date</label>
                <input style={ui.input} type="date" name="start_date" value={form.start_date} onChange={handleChange} disabled={loading} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={ui.label}>End Date</label>
                <input style={ui.input} type="date" name="end_date" value={form.end_date} onChange={handleChange} disabled={loading} />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={ui.label}>Budget Amount (KES)</label>
              <input style={ui.input} type="number" name="total_budget" value={form.total_budget} onChange={handleChange} placeholder="Enter budget amount" min="1" disabled={loading} />
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={ui.label}>Description</label>
              <textarea style={{ ...ui.input, minHeight: 96, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="Enter event description" rows={4} disabled={loading} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 26 }}>
              <button type="button" style={ui.ghostBtn} onClick={() => navigate('/events')} disabled={loading}>Cancel</button>
              <button type="submit" style={{ ...ui.primaryBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>

        {/* Live preview */}
        <div style={{ ...ui.card, padding: 26 }}>
          <h2 style={{ ...ui.sectionTitle, marginBottom: 18 }}>Event Preview</h2>
          {form.name || form.total_budget ? (
            <div>
              <div style={{ height: 90, borderRadius: 14, background: `linear-gradient(135deg, ${T.blue}, ${T.blueDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <IconCalendar size={34} color="rgba(255,255,255,0.9)" />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.ink }}>{form.name || 'Untitled event'}</h3>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: T.muted }}>
                {form.start_date ? `${formatDate(form.start_date)} – ${formatDate(form.end_date) || '…'}` : 'Dates not set'}
              </p>
              <div style={{ marginTop: 18, padding: '14px 16px', background: T.blueSoft, borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: T.blueDark, fontWeight: 600 }}>Budget</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.blueDark }}>{form.total_budget ? formatKES(form.total_budget) : 'KES 0'}</div>
              </div>
              {form.description && <p style={{ marginTop: 16, fontSize: 14, color: T.body, lineHeight: 1.55 }}>{form.description}</p>}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 12px', color: T.muted }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <IconCalendar size={28} color={T.blue} />
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>Your event details will appear here as you type.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

const errBox = { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 18, fontSize: 14, fontWeight: 500 }
