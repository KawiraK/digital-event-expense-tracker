import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReports, createReport, deleteReport } from '../api/reports'
import { getEvents } from '../api/events'

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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

    setGenerating(true)
    setError('')
    setSuccess('')
    try {
      const res = await createReport({
        event: parseInt(selectedEvent),
        report_type: reportType,
      })
      setReports(prev => [res.data, ...prev])
      setSuccess('Report generated successfully.')
      setSelectedEvent('')
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Failed to generate report.'
      setError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try {
      await deleteReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch {
      alert('Failed to delete report.')
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
        <button style={styles.navBtn} onClick={() => navigate('/alerts')}>Alerts</button>
        <button style={styles.navBtn} onClick={() => navigate('/reports')}>Reports</button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.pageTitle}>Reports</h2>

        {/* Generate Report Form */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Generate New Report</h3>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          <form onSubmit={handleGenerate} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Event *</label>
                <select
                  style={styles.input}
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  disabled={generating}
                >
                  <option value="">-- Select an event --</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Report Type</label>
                <select
                  style={styles.input}
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  disabled={generating}
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div style={styles.fieldBtn}>
                <label style={{ ...styles.label, color: 'transparent' }}>.</label>
                <button type="submit" style={styles.submitBtn} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Reports List */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Generated Reports ({reports.length})</h3>

          {loading && <p style={styles.empty}>Loading reports...</p>}

          {!loading && reports.length === 0 && (
            <p style={styles.empty}>No reports yet. Generate your first report above.</p>
          )}

          {reports.map(report => (
            <div key={report.id} style={styles.reportCard}>
              <div style={styles.reportHeader}>
                <div>
                  <h4 style={styles.reportTitle}>
                    {report.data?.event_name || 'Report'} —
                    <span style={styles.reportType}> {report.report_type}</span>
                  </h4>
                  <p style={styles.reportMeta}>
                    Generated: {new Date(report.generated_at).toLocaleString()}
                  </p>
                </div>
                <button style={styles.deleteBtn} onClick={() => handleDelete(report.id)}>
                  Delete
                </button>
              </div>

              {report.data && (
                <div style={styles.reportBody}>
                  <div style={styles.reportStats}>
                    <div style={styles.reportStat}>
                      <p style={styles.statLabel}>Total Budget</p>
                      <p style={styles.statValue}>KSh {report.data.total_budget?.toLocaleString()}</p>
                    </div>
                    <div style={styles.reportStat}>
                      <p style={styles.statLabel}>Total Spent</p>
                      <p style={styles.statValue}>KSh {report.data.total_spent?.toLocaleString()}</p>
                    </div>
                    <div style={styles.reportStat}>
                      <p style={styles.statLabel}>Remaining</p>
                      <p style={{ ...styles.statValue, color: report.data.remaining_budget < 0 ? '#ef4444' : '#22c55e' }}>
                        KSh {report.data.remaining_budget?.toLocaleString()}
                      </p>
                    </div>
                    <div style={styles.reportStat}>
                      <p style={styles.statLabel}>Spend Ratio</p>
                      <p style={styles.statValue}>{report.data.spend_ratio?.toFixed(1)}%</p>
                    </div>
                    <div style={styles.reportStat}>
                      <p style={styles.statLabel}>Expenses</p>
                      <p style={styles.statValue}>{report.data.expense_count}</p>
                    </div>
                  </div>

                  {report.data.by_category && Object.keys(report.data.by_category).length > 0 && (
                    <div style={styles.categoryBreakdown}>
                      <p style={styles.breakdownTitle}>Spending by Category</p>
                      {Object.entries(report.data.by_category).map(([cat, amount]) => (
                        <div key={cat} style={styles.categoryRow}>
                          <span style={styles.categoryName}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                          <span style={styles.categoryAmount}>
                            KSh {amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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
  content: { padding: '24px 32px' },
  pageTitle: { margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700', color: '#1a1a2e' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardTitle: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
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
  reportCard: { border: '1px solid #eee', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  reportTitle: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1a1a2e' },
  reportType: { color: '#4f46e5', textTransform: 'capitalize' },
  reportMeta: { margin: 0, fontSize: '13px', color: '#888' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  reportBody: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
  reportStats: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' },
  reportStat: { flex: 1, minWidth: '100px', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px' },
  statLabel: { margin: '0 0 4px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: '600' },
  statValue: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  categoryBreakdown: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px' },
  breakdownTitle: { margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#555', textTransform: 'uppercase' },
  categoryRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '14px' },
  categoryName: { color: '#333' },
  categoryAmount: { fontWeight: '600', color: '#1a1a2e' },
}