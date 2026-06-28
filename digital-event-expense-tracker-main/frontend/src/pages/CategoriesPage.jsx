import { useEffect, useState } from 'react'
import { getCategories, createCategory, deleteCategory } from '../api/categories'
import AppLayout from '../components/layout/AppLayout'
import { IconTrash, IconPlus } from '../components/ui/Icons'
import { T, ui, formatKES, CATEGORY_COLORS } from '../theme'

const CATEGORY_CHOICES = ['venue', 'catering', 'decoration', 'transport', 'entertainment', 'contingency']

export default function CategoriesPage() {
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

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name) { setError('Please select a category name.'); return }
    if (!form.default_budget || parseFloat(form.default_budget) < 0) { setError('Please enter a valid default budget.'); return }
    if (categories.find(c => c.name === form.name)) { setError(`Category "${form.name}" already exists.`); return }

    setLoading(true)
    try {
      const res = await createCategory(form)
      setCategories(prev => [...prev, res.data])
      setForm({ name: '', default_budget: '' })
      setSuccess(`Category "${res.data.name}" created successfully.`)
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create category.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cid, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await deleteCategory(cid)
      setCategories(prev => prev.filter(c => c.id !== cid))
    } catch {
      alert('Failed to delete category. It may be in use by an expense.')
    }
  }

  const existingNames = categories.map(c => c.name)
  const availableChoices = CATEGORY_CHOICES.filter(c => !existingNames.includes(c))
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <AppLayout title="Categories" subtitle="Group your expenses. Your backend supports exactly 6 types.">
      {/* Add category */}
      <div style={{ ...ui.card, padding: 24, marginBottom: 18 }}>
        <h2 style={{ ...ui.sectionTitle, marginBottom: 18 }}>Add Category</h2>
        {error && <div style={errBox}>{error}</div>}
        {success && <div style={okBox}>{success}</div>}

        {availableChoices.length === 0 ? (
          <p style={{ color: T.muted, margin: 0 }}>All 6 categories have been added.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={ui.label}>Category Name</label>
              <select style={ui.input} name="name" value={form.name} onChange={handleChange} disabled={loading}>
                <option value="">Select category</option>
                {availableChoices.map(choice => <option key={choice} value={choice}>{cap(choice)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={ui.label}>Default Budget (KES)</label>
              <input style={ui.input} type="number" name="default_budget" value={form.default_budget} onChange={handleChange} placeholder="e.g. 50000" min="0" disabled={loading} />
            </div>
            <button type="submit" style={{ ...ui.primaryBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconPlus size={16} color="#fff" /> {loading ? 'Adding…' : 'Add Category'}</span>
            </button>
          </form>
        )}
      </div>

      {/* List */}
      <div style={{ ...ui.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px' }}>
          <h2 style={ui.sectionTitle}>Existing Categories ({categories.length}/6)</h2>
        </div>
        {categories.length === 0 ? (
          <p style={{ color: T.muted, padding: '0 24px 28px' }}>No categories yet. Add one above.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ background: '#F9FBFF' }}>
                  {['Name', 'Default Budget', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderTop: `1px solid ${T.line}` }}>
                    <td style={td}>
                      <span style={{ ...ui.pill('blue'), background: (CATEGORY_COLORS[cat.name] || T.blue) + '1A', color: CATEGORY_COLORS[cat.name] || T.blueDark }}>{cap(cat.name)}</span>
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: T.ink }}>{formatKES(cat.default_budget)}</td>
                    <td style={td}>
                      <button onClick={() => handleDelete(cat.id, cat.name)} style={iconBtn} title="Delete">
                        <IconTrash size={16} color={T.red} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

const th = { textAlign: 'left', padding: '14px 24px', fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }
const td = { padding: '14px 24px', fontSize: 14, color: T.body, verticalAlign: 'middle' }
const iconBtn = { background: '#F4F7FE', border: `1px solid ${T.line}`, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const errBox = { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 500 }
const okBox = { background: T.greenSoft, color: '#03986F', padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 500 }
