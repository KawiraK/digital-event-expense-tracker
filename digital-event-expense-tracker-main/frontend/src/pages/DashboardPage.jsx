import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvents } from '../api/events'
import { getExpenses } from '../api/expenses'
import { getAlerts } from '../api/alerts'
import AppLayout from '../components/layout/AppLayout'
import StatCard from '../components/ui/StatCard'
import { DonutChart, BudgetBars } from '../components/ui/Charts'
import { IconWallet, IconCoins, IconMoney, IconCalendar, IconPlus } from '../components/ui/Icons'
import { T, ui, formatKES, formatDate, SERIES_COLORS } from '../theme'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [expenses, setExpenses] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, expensesRes] = await Promise.all([getEvents(), getExpenses()])
        setEvents(eventsRes.data)
        setExpenses(expensesRes.data)
        if (user.role === 'finance_manager' || user.role === 'admin') {
          const alertsRes = await getAlerts()
          setAlerts(alertsRes.data)
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const totalBudget = events.reduce((sum, e) => sum + parseFloat(e.total_budget || 0), 0)
  const totalSpent = events.reduce((sum, e) => sum + parseFloat(e.total_spent || 0), 0)
  const remaining = totalBudget - totalSpent
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const eventName = (id) => events.find(e => e.id === id)?.name || 'Event'

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.incurred_at) - new Date(a.incurred_at))
    .slice(0, 5)

  const budgetBarData = events.slice(0, 5).map(e => ({
    label: e.name, budget: parseFloat(e.total_budget || 0), spent: parseFloat(e.total_spent || 0),
  }))

  const donutData = events
    .filter(e => parseFloat(e.total_spent || 0) > 0)
    .sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent))
    .slice(0, 6)
    .map((e, i) => ({ label: e.name, value: parseFloat(e.total_spent || 0), color: SERIES_COLORS[i % SERIES_COLORS.length] }))

  const canCreate = user.role === 'organizer' || user.role === 'admin'

  const newEventBtn = canCreate ? (
    <button style={ui.primaryBtn} onClick={() => navigate('/events/new')}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconPlus size={16} color="#fff" /> New Event</span>
    </button>
  ) : null

  return (
    <AppLayout
      title={`${greeting}, ${user.username} 👋`}
      subtitle={loading ? 'Loading your overview…' : `You have ${events.length} event${events.length === 1 ? '' : 's'}. Budget utilization is ${utilization}%.`}
      actions={newEventBtn}
    >
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
        <StatCard icon={IconWallet} label="Total Budget" value={formatKES(totalBudget)} accent={T.blue} accentBg={T.blueSoft} />
        <StatCard icon={IconMoney} label="Total Spent" value={formatKES(totalSpent)} accent={T.orange} accentBg={T.orangeSoft} />
        <StatCard icon={IconCoins} label="Remaining Budget" value={formatKES(remaining)} accent={remaining < 0 ? T.red : T.green} accentBg={remaining < 0 ? T.redSoft : T.greenSoft} />
        <StatCard icon={IconCalendar} label="Active Events" value={events.length} accent={T.blue} accentBg={T.blueSoft}
          footnote={unresolvedAlerts > 0 ? `${unresolvedAlerts} active alert${unresolvedAlerts === 1 ? '' : 's'}` : undefined} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 18, marginBottom: 22 }} className="dash-row">
        <div style={{ ...ui.card, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h2 style={ui.sectionTitle}>Budget vs Spending</h2>
            <span style={ui.pill('blue')} onClick={() => navigate('/events')}>View all</span>
          </div>
          {loading ? <Skeleton /> : <BudgetBars data={budgetBarData} />}
        </div>

        <div style={{ ...ui.card, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={ui.sectionTitle}>Recent Expenses</h2>
          </div>
          {loading ? <Skeleton /> : recentExpenses.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>No expenses recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentExpenses.map(ex => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.vendor_name}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{eventName(ex.event)} · {formatDate(ex.incurred_at)}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', marginLeft: 12 }}>{formatKES(ex.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distribution donut */}
      <div style={{ ...ui.card, padding: 24 }}>
        <h2 style={{ ...ui.sectionTitle, marginBottom: 22 }}>Spending Distribution by Event</h2>
        {loading ? <Skeleton /> : (
          <DonutChart data={donutData} centerLabel="Total Spent" centerValue={formatKES(totalSpent)} />
        )}
      </div>
    </AppLayout>
  )
}

function Skeleton() {
  return <div style={{ height: 120, borderRadius: 12, background: 'linear-gradient(90deg,#eef2fb,#f7f9ff,#eef2fb)' }} />
}
