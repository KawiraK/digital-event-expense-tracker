import { useEffect, useState } from 'react'
import { getReports, createReport, deleteReport } from '../api/reports'
import { getEvents } from '../api/events'
import AppLayout from '../components/layout/AppLayout'
import { DonutChart } from '../components/ui/Charts'
import { IconTrash, IconFile, IconChart } from '../components/ui/Icons'
import { T, ui, formatKES, CATEGORY_COLORS, SERIES_COLORS } from '../theme'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [reportType, setReportType] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([getReports(), getEvents()])
      .then(([reportsRes, eventsRes]) => {
        setReports(reportsRes.data)
        setEvents(eventsRes.data)
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!selectedEvent) { setError('Please select an event.'); return }
    setGenerating(true); setError(''); setSuccess('')
    try {
      const res = await createReport({ event: parseInt(selectedEvent), report_type: reportType })
      setReports(prev => [res.data, ...prev])
      setSuccess('Report generated successfully.')
      setSelectedEvent('')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to generate report.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await deleteReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch { alert('Failed to delete report.') }
  }

  const donutFor = (byCat) => {
    if (!byCat) return []
    return Object.entries(byCat).map(([cat, amount], i) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: Number(amount) || 0,
      color: CATEGORY_COLORS[cat] || SERIES_COLORS[i % SERIES_COLORS.length],
    }))
  }

  const cap = (s) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1)

  return (
    <AppLayout title="Reports" subtitle="Generate and review reports for your events and expenses.">
      {/* Generate panel */}
      <div className="form-preview-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 18, marginBottom: 22 }}>
        <div style={{ ...ui.card, padding: 24 }}>
          <h2 style={{ ...ui.sectionTitle, marginBottom: 18 }}>Generate Report</h2>
          {error && <div style={errBox}>{error}</div>}
          {success && <div style={okBox}>{success}</div>}
          <form onSubmit={handleGenerate}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={ui.label}>Event</label>
                <select style={ui.input} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} disabled={generating}>
                  <option value="">Select an event</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={ui.label}>Report Type</label>
                <select style={ui.input} value={reportType} onChange={e => setReportType(e.target.value)} disabled={generating}>
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ ...ui.primaryBtn, marginTop: 22, opacity: generating ? 0.7 : 1 }} disabled={generating}>
              {generating ? 'Generating…' : 'Generate Report'}
            </button>
          </form>
        </div>

        <div style={{ ...ui.card, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <IconFile size={28} color={T.blue} />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: T.muted, maxWidth: 240 }}>
            Pick an event and generate a report. It will appear in the list below with a full breakdown.
          </p>
        </div>
      </div>

      {/* Reports list */}
      <h2 style={{ ...ui.sectionTitle, marginBottom: 14 }}>Generated Reports ({reports.length})</h2>
      {loading && <p style={{ color: T.muted }}>Loading reports…</p>}
      {!loading && reports.length === 0 && (
        <div style={{ ...ui.card, padding: 40, textAlign: 'center', color: T.muted }}>No reports yet. Generate your first report above.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {reports.map(report => {
          const d = report.data || {}
          const donut = donutFor(d.by_category)
          return (
            <div key={report.id} style={{ ...ui.card, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink }}>
                    {d.event_name || 'Report'} <span style={{ ...ui.pill('blue'), marginLeft: 6, verticalAlign: 'middle' }}>{cap(report.report_type)}</span>
                  </h3>
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: T.muted }}>
                    Generated {new Date(report.generated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => handleDelete(report.id)} style={iconBtn} title="Delete report">
                  <IconTrash size={16} color={T.red} />
                </button>
              </div>

              {/* Stat tiles */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                <Tile label="Total Budget" value={formatKES(d.total_budget)} />
                <Tile label="Total Spent" value={formatKES(d.total_spent)} />
                <Tile label="Remaining" value={formatKES(d.remaining_budget)} color={d.remaining_budget < 0 ? T.red : T.green} />
                <Tile label="Spend Ratio" value={`${Number(d.spend_ratio ?? 0).toFixed(1)}%`} />
                <Tile label="Expenses" value={d.expense_count ?? 0} />
              </div>

              {donut.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <IconChart size={18} color={T.blue} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Expense Distribution</span>
                  </div>
                  <DonutChart data={donut} centerLabel="Spent" centerValue={formatKES(d.total_spent)} size={170} thickness={22} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}

function Tile({ label, value, color = T.ink }) {
  return (
    <div style={{ flex: 1, minWidth: 130, background: '#F9FBFF', border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  )
}

const iconBtn = { background: '#F4F7FE', border: `1px solid ${T.line}`, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const errBox = { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 500 }
const okBox = { background: T.greenSoft, color: '#03986F', padding: '11px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 500 }
