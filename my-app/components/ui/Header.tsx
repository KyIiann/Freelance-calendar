// React default import is not needed with the JSX runtime
import ThemeToggle from './ThemeToggle'
import LoginRegister from './LoginRegister'
import type { AuthPayload } from '../../src/services/auth'
// removed unused type import to fix lint error

type HeaderProps = {
  theme: 'light' | 'dark'
  onToggle: (t: 'light' | 'dark') => void
  userAuth: { id?: string; name?: string; email?: string } | null
  onLogin?: (u: AuthPayload) => void
  onLogout?: () => void
  onOpenAdmin?: (v: string | null) => void
}

export default function Header({ theme, onToggle, userAuth, onLogin, onLogout, onOpenAdmin }: HeaderProps) {
  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn-back" onClick={() => onOpenAdmin && onOpenAdmin(null)}>← Retour</button>
        <h2 style={{ margin: 0 }}>Mini profil</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <ThemeToggle theme={theme} onToggle={onToggle} />
        {userAuth ? (
          <>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{userAuth?.name || userAuth?.email}</div>
            <button className="btn-back" onClick={() => onLogout && onLogout()}>Logout</button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}><LoginRegister onLogin={onLogin} /></div>
        )}
      </div>
    </header>
  )
}
