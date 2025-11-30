import React from 'react'
import './login-register.css'
import { useRef } from 'react'
import useFocusTrap from '../../src/hooks/useFocusTrap'
import { login, register } from '../../src/services/auth'
import type { AuthPayload } from '../../src/services/auth'

export default function LoginRegister({ onLogin, onClose, trapFocus }: { onLogin?: (u: AuthPayload) => void, onClose?: () => void, trapFocus?: boolean }) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const rootRef = useRef<HTMLFormElement | null>(null)
  // rootRef needs to conform to HTMLElement ref for the focus trap; cast to correct type
  useFocusTrap(rootRef as unknown as React.RefObject<HTMLElement>, !!trapFocus, onClose)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (onLogin) onLogin(result)
      } else {
        const result = await register(email, password, name)
        if (onLogin) onLogin(result)
      }
    } catch (err: unknown) {
      const e = err as Error
      setMessage(e?.message || 'Erreur')
    } finally { setBusy(false) }
  }

  return (
    <form ref={rootRef} tabIndex={-1} onSubmit={handleSubmit} className="login-register">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={() => setMode('login')} disabled={mode === 'login'}>Connexion</button>
        <button type="button" onClick={() => setMode('register')} disabled={mode === 'register'}>Créer un compte</button>
      </div>
      {mode === 'register' && (
        <div style={{ marginTop: 8 }}>
          <input placeholder='Nom' value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <input placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <input placeholder='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type='submit' disabled={busy}>{busy ? 'En cours...' : (mode === 'login' ? 'Se connecter' : 'Créer un compte')}</button>
      </div>
      {message && <div style={{ color: 'red', marginTop: 8 }}>{message}</div>}
    </form>
  )
}
