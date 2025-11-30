// using JSX runtime, no React default import needed
import './Login.css'
import LoginRegister from '@components/ui/LoginRegister'
import type { AuthPayload } from '../../src/services/auth'
import { useEffect } from 'react'

type LoginProps = {
  onLogin?: (u: AuthPayload) => void
  onCancel?: () => void
  next?: string
}

export default function Login({ onLogin, onCancel, next }: LoginProps) {
  // if you pass a query param, redirect handled by the App; keep this simple
  useEffect(() => {
    // ensure focus management and any handlers mount here if needed
  }, [])
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Connexion</h1>
        <p className="login-help">Connecte-toi pour gérer ton profil et réserver un créneau.</p>
        <LoginRegister onLogin={onLogin} />
        {next && <div style={{ marginTop: 8, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Après connexion, tu seras redirigé vers: <strong>{next}</strong></div>}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <button className="btn-back" onClick={() => onCancel && onCancel()}>Retour</button>
        </div>
      </div>
    </div>
  )
}
