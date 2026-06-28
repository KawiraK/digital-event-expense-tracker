import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvent, deleteEvent } from '../api/events'
import { deleteExpense } from '../api/expenses'
import { getCategories } from '../api/categories'
import AppLayout from '../components/layout/AppLayout'
import StatCard from '../components/ui/StatCard'
import { IconPlus, IconTrash, IconEdit, IconWallet, IconMoney, IconCoins, IconChart, IconArrowLeft } from '../components/ui/Icons'
import { T, ui, formatKES, formatDate, ratioColor, CATEGORY_COLORS } from '../theme'

export default function EventDetailPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getEvent(id), getCategories().catch(() => ({ data: [] }))])
      .then(([eventRes, catRes]) => {
        setEvent(eventRes.data)
        setCategories(catRes.data)
      })
      .catch(() => setError('Failed to load event.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDeleteEvent = async () => {
    if (!window.confirm('Delete this event and all its expenses?')) return
    try {
      await deleteEvent(id)
      navigate('/events')
    } catch { alert('Failed to delete event.') }
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteExpense(expenseId)
      setEvent(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== expenseId) }))
    } catch { alert('Failed to delete expense.') }
  }

  const catName = (cid) => {
    const c = categories.find(x => x.id === cid)
    if (!c) return 'Category'
    return c.name.charAt(0).toUpperCase() + c.name.slice(1)
  }
  const catKey = (cid) => categories.find(x => x.id === cid)?.name

  if (loading) return <AppLayout title="Loading…"><p style={{ color: T.muted }}>Loading event…</p></AppLayout>
  if (error) return <AppLayout title="Event"><p style={{ color: T.red }}>{error}</p></AppLayout>
  if (!event) return null

  const ratio = parseFloat(event.spend_ratio || 0)
  const color = ratioColor(ratio)
  const canManage = user.role === 'organizer' || user.role === 'admin'
  const canAddExpense = ['organizer', 'finance_manager', 'admin'].includes(user.role)
  const expenses = event.expenses || []

  const actions = (
    <>
      {canManage && (
        <button style={ui.ghostBtn} onClick={() => navigate(`/events/${id}/edit`)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconEdit size={16} color={T.body} /> Edit</span>
        </button>
      )}
      {canAddExpense && (
        <button style={ui.primaryBtn} onClick={() => navigate(`/events/${id}/expenses/new`)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconPlus size={16} color="#fff" /> Add Expense</span>
        </button>
      )}
    </>
  )

  return (
    <AppLayout title={event.name} subtitle={`${formatDate(event.start_date)} – ${formatDate(event.end_date)}`} actions={actions}>
      <button onClick={() => navigate('/events')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: T.muted, fontSize: 14, cursor: 'pointer', marginBottom: 18 }}>
        <IconArrowLeft size={16} color={T.muted} /> Back to events
      </button>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
        <StatCard icon={IconWallet} label="Budget" value={formatKES(event.total_budget)} accent={T.blue} accentBg={T.blueSoft} />
        <StatCard icon={IconMoney} label="Spent" value={formatKES(event.total_spent)} accent={T.orange} accentBg={T.orangeSoft} />
        <StatCard icon={IconCoins} label="Remaining" value={formatKES(event.remaining_budget)} accent={parseFloat(event.remaining_budget) < 0 ? T.red : T.green} accentBg={parseFloat(event.remaining_budget) < 0 ? T.redSoft : T.greenSoft} />
        <StatCard icon={IconChart} label="Spend Ratio" value={`${ratio.toFixed(1)}%`} accent={color} accentBg={ratio >= 90 ? T.redSoft : T.blueSoft} />
      </div>

      {/* Progress */}
      <div style={{ ...ui.card, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.body }}>Budget utilization</span>
          <span style={{ fontSize: 14, fontWeight: 700, color }}>{ratio.toFixed(1)}%</span>
        </div>
        <div style={{ height: 10, background: T.line, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(ratio, 100)}%`, background: color, borderRadius: 999 }} />
        </div>
        {event.description && <p style={{ margin: '16px 0 0', fontSize: 14, color: T.body, lineHeight: 1.55 }}>{event.description}</p>}
      </div>

      {/* Expenses table */}
      <div style={{ ...ui.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
          <h2 style={ui.sectionTitle}>Expenses ({expenses.length})</h2>
        </div>
        {expenses.length === 0 ? (
          <p style={{ color: T.muted, fontSize: 14, padding: '0 24px 28px' }}>No expenses recorded for this event yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr style={{ background: '#F9FBFF' }}>
                  {['Vendor', 'Category', 'Amount', 'Date', 'Actions'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map(ex => (
                  <tr key={ex.id} style={{ borderTop: `1px solid ${T.line}` }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: T.ink }}>{ex.vendor_name}</div>
                      {ex.description && <div style={{ fontSize: 12, color: T.muted }}>{ex.description}</div>}
                    </td>
                    <td style={td}>
                      <span style={{ ...ui.pill('blue'), background: (CATEGORY_COLORS[catKey(ex.category)] || T.blue) + '1A', color: CATEGORY_COLORS[catKey(ex.category)] || T.blueDark }}>
                        {catName(ex.category)}
                      </span>
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: T.ink }}>{formatKES(ex.amount)}</td>
                    <td style={{ ...td, color: T.muted }}>{formatDate(ex.incurred_at)}</td>
                    <td style={td}>
                      {canAddExpense ? (
                        <button onClick={() => handleDeleteExpense(ex.id)} style={iconBtn} title="Delete expense">
                          <IconTrash size={16} color={T.red} />
                        </button>
                      ) : <span style={{ color: T.muted }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage && (
        <button onClick={handleDeleteEvent} style={{ marginTop: 22, background: 'transparent', border: `1px solid ${T.redSoft}`, color: T.red, borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <IconTrash size={16} color={T.red} /> Delete event
        </button>
      )}
    </AppLayout>
  )
}

const th = { textAlign: 'left', padding: '14px 24px', fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }
const td = { padding: '14px 24px', fontSize: 14, color: T.body, verticalAlign: 'middle' }
const iconBtn = { background: '#F4F7FE', border: `1px solid ${T.line}`, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
