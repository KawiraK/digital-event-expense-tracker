import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvents, deleteEvent } from '../api/events'
import AppLayout from '../components/layout/AppLayout'
import { IconPlus, IconTrash, IconEdit } from '../components/ui/Icons'
import { T, ui, formatKES, formatDate, ratioColor } from '../theme'

export default function EventListPage() {
  const { user } = useAuth()
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

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this event?')) return
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(ev => ev.id !== id))
    } catch {
      alert('Failed to delete event.')
    }
  }

  const canManage = user.role === 'organizer' || user.role === 'admin'

  const newBtn = canManage ? (
    <button style={ui.primaryBtn} onClick={() => navigate('/events/new')}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconPlus size={16} color="#fff" /> New Event</span>
    </button>
  ) : null

  return (
    <AppLayout title="My Events" subtitle="All your events, budgets and spending at a glance" actions={newBtn}>
      {loading && <p style={{ color: T.muted }}>Loading events…</p>}
      {error && <p style={{ color: T.red }}>{error}</p>}

      {!loading && events.length === 0 && (
        <div style={{ ...ui.card, padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: T.ink, margin: 0 }}>No events yet</p>
          <p style={{ color: T.muted, margin: '8px 0 20px' }}>Create your first event to start tracking its budget.</p>
          {canManage && <button style={ui.primaryBtn} onClick={() => navigate('/events/new')}>+ New Event</button>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {events.map(event => {
          const ratio = parseFloat(event.spend_ratio || 0)
          const color = ratioColor(ratio)
          return (
            <div key={event.id} style={{ ...ui.card, padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => navigate(`/events/${event.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.name}</h3>
                  <p style={{ margin: '5px 0 0', fontSize: 13, color: T.muted }}>
                    {formatDate(event.start_date)} – {formatDate(event.end_date)}
                  </p>
                </div>
                <span style={ui.pill(ratio >= 100 ? 'over' : ratio >= 90 ? 'orange' : 'green')}>{ratio.toFixed(0)}%</span>
              </div>

              <div style={{ display: 'flex', gap: 24, margin: '18px 0 14px' }}>
                <div>
                  <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Budget</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{formatKES(event.total_budget)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Spent</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{formatKES(event.total_spent)}</div>
                </div>
              </div>

              <div style={{ height: 8, background: T.line, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(ratio, 100)}%`, background: color, borderRadius: 999 }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.blue }}>View Details →</span>
                {canManage && (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}/edit`) }} style={iconBtn} title="Edit">
                      <IconEdit size={16} color={T.muted} />
                    </button>
                    <button onClick={(e) => handleDelete(e, event.id)} style={iconBtn} title="Delete">
                      <IconTrash size={16} color={T.red} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}

const iconBtn = {
  background: '#F4F7FE', border: `1px solid ${T.line}`, borderRadius: 9,
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
