import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { T } from '../theme'
import AuthBrandPanel from '../components/layout/AuthBrandPanel'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.username.trim()) return 'Username is required.'
    if (form.username.length < 3) return 'Username must be at least 3 characters.'
    if (!form.email.trim()) return 'Email is required.'
    if (!form.email.includes('@')) return 'Enter a valid email address.'
    if (!form.password) return 'Password is required.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.shell}>
      <AuthBrandPanel />
      <div style={s.formSide}>
        <div style={s.card}>
          <h1 style={s.title}>Create your account ✨</h1>
          <p style={s.subtitle}>Start planning and tracking your event budgets</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Username</label>
            <input style={s.input} name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" disabled={loading} />

            <label style={{ ...s.label, marginTop: 16 }}>Email</label>
            <input style={s.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" disabled={loading} />

            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={{ ...s.label, marginTop: 16 }}>Password</label>
                <input style={s.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="6+ characters" disabled={loading} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...s.label, marginTop: 16 }}>Confirm</label>
                <input style={s.input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" disabled={loading} />
              </div>
            </div>

            <div style={s.note}>
              New accounts get the <strong>Organizer</strong> role. An admin can change it later.
            </div>

            <button type="submit" style={{ ...s.signIn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <span style={s.link} onClick={() => navigate('/login')}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: T.bg },
  formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: T.ink },
  subtitle: { margin: '8px 0 26px', fontSize: 15, color: T.muted },
  error: { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 18, fontSize: 14, fontWeight: 500 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: T.body, marginBottom: 8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 15px', borderRadius: 10, border: `1px solid ${T.line}`, background: '#F9FBFF', fontSize: 14, color: T.ink, outline: 'none' },
  row: { display: 'flex', gap: 14 },
  note: { background: T.blueSoft, color: T.blueDark, padding: '11px 14px', borderRadius: 10, fontSize: 13, margin: '22px 0' },
  signIn: { width: '100%', padding: 14, background: T.blue, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px rgba(37,99,235,0.30)' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: T.muted },
  link: { color: T.blue, fontWeight: 700, cursor: 'pointer' },
}
