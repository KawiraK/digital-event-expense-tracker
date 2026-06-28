import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { T } from '../theme'
import { IconEye, IconEyeOff } from '../components/ui/Icons'
import AuthBrandPanel from '../components/layout/AuthBrandPanel'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    try {
      const res = await login(username, password)
      setUser(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.shell}>
      <AuthBrandPanel />
      <div style={s.formSide}>
        <div style={s.card}>
          <h1 style={s.title}>Welcome back 👋</h1>
          <p style={s.subtitle}>Sign in to continue to your account</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />

            <label style={{ ...s.label, marginTop: 18 }}>Password</label>
            <div style={s.pwWrap}>
              <input
                style={{ ...s.input, paddingRight: 44 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn} aria-label="Toggle password">
                {showPw ? <IconEyeOff size={18} color={T.muted} /> : <IconEye size={18} color={T.muted} />}
              </button>
            </div>

            <div style={s.between}>
              <label style={s.remember}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <span style={s.forgot}>Forgot password?</span>
            </div>

            <button type="submit" style={{ ...s.signIn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={s.footer}>
            Don&apos;t have an account?{' '}
            <span style={s.link} onClick={() => navigate('/register')}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: T.bg },
  formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: T.ink },
  subtitle: { margin: '8px 0 28px', fontSize: 15, color: T.muted },
  error: { background: T.redSoft, color: '#C23B30', padding: '11px 14px', borderRadius: 10, marginBottom: 18, fontSize: 14, fontWeight: 500 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: T.body, marginBottom: 8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 15px', borderRadius: 10, border: `1px solid ${T.line}`, background: '#F9FBFF', fontSize: 14, color: T.ink, outline: 'none' },
  pwWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' },
  between: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 24px' },
  remember: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.body, cursor: 'pointer' },
  forgot: { fontSize: 13, color: T.blue, fontWeight: 600, cursor: 'pointer' },
  signIn: { width: '100%', padding: 14, background: T.blue, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px rgba(37,99,235,0.30)' },
  footer: { textAlign: 'center', marginTop: 26, fontSize: 14, color: T.muted },
  link: { color: T.blue, fontWeight: 700, cursor: 'pointer' },
}
