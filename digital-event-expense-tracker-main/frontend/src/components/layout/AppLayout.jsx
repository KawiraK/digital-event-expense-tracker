import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { T } from '../../theme'
import {
  IconDashboard, IconCalendar, IconTag, IconBell, IconChart,
  IconLogout, IconSearch,
} from '../ui/Icons'

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: IconDashboard },
  { label: 'Events', to: '/events', icon: IconCalendar },
  { label: 'Categories', to: '/categories', icon: IconTag },
  { label: 'Alerts', to: '/alerts', icon: IconBell, roles: ['finance_manager', 'admin'] },
  { label: 'Reports', to: '/reports', icon: IconChart, roles: ['finance_manager', 'admin'] },
]

function NavItem({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className="nav-item"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
        border: 'none', textAlign: 'left',
        background: active ? T.blue : 'transparent',
        color: active ? '#fff' : '#A3AED0',
        fontSize: 15, fontWeight: active ? 700 : 500,
        boxShadow: active ? '0 8px 18px rgba(37,99,235,0.35)' : 'none',
        transition: 'background .15s',
      }}
    >
      <Icon size={20} color={active ? '#fff' : '#A3AED0'} />
      <span className="nav-label">{item.label}</span>
    </button>
  )
}

export default function AppLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const role = user?.role
  const items = NAV.filter(i => !i.roles || i.roles.includes(role))
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initial = (user?.username || '?').charAt(0).toUpperCase()

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      {/* Sidebar */}
      <aside className="app-sidebar" style={{
        width: 260, background: T.navy, color: '#fff', flexShrink: 0,
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '26px 22px 22px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: T.blue, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18,
          }}>E</div>
          <div className="nav-label" style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Digital Event</div>
            <div style={{ fontSize: 13, color: '#A3AED0' }}>Expense Tracker</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px 14px' }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 14px', flex: 1 }}>
          {items.map(item => (
            <NavItem key={item.to} item={item} active={isActive(item.to)} onClick={() => navigate(item.to)} />
          ))}
        </nav>

        <div style={{ padding: '14px' }}>
          <button onClick={handleLogout} className="nav-item" style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '12px 16px', borderRadius: 12, cursor: 'pointer', border: 'none',
            background: 'transparent', color: T.logout, fontSize: 15, fontWeight: 600, textAlign: 'left',
          }}>
            <IconLogout size={20} color={T.logout} />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="app-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px',
          position: 'sticky', top: 0, zIndex: 20, background: 'rgba(244,247,254,0.85)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fff',
            borderRadius: 999, padding: '10px 16px', flex: 1, maxWidth: 420,
            border: `1px solid ${T.line}`, boxShadow: T.shadowSm,
          }}>
            <IconSearch size={18} color={T.muted} />
            <input
              placeholder="Search anything…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: T.ink, width: '100%' }}
            />
          </div>

          <div style={{ flex: 1 }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, background: '#fff',
            borderRadius: 999, padding: '8px 10px 8px 16px', border: `1px solid ${T.line}`, boxShadow: T.shadowSm,
            position: 'relative',
          }}>
            <IconBell size={20} color={T.muted} />
            <button onClick={() => setMenuOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: T.blue, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15,
              }}>{initial}</div>
              <span className="nav-label" style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>
                {user?.username}
              </span>
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, background: '#fff', borderRadius: 12,
                boxShadow: T.shadow, border: `1px solid ${T.line}`, padding: 8, minWidth: 180, zIndex: 30,
              }}>
                <div style={{ padding: '8px 12px', fontSize: 13, color: T.muted }}>
                  Signed in as<br /><strong style={{ color: T.ink }}>{user?.username}</strong>
                  <span style={{ color: T.muted }}> · {role}</span>
                </div>
                <div style={{ height: 1, background: T.line, margin: '4px 0' }} />
                <button onClick={handleLogout} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none',
                  background: 'transparent', cursor: 'pointer', color: T.logout, fontWeight: 600, fontSize: 14, borderRadius: 8,
                }}>Log out</button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '8px 28px 40px' }}>
          {(title || actions) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
              <div>
                {title && <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: '-0.4px' }}>{title}</h1>}
                {subtitle && <p style={{ margin: '6px 0 0 0', fontSize: 15, color: T.muted }}>{subtitle}</p>}
              </div>
              {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
