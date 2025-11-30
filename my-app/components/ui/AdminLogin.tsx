import React from 'react'
import { login } from '../../src/services/admin'

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      onSuccess()
    } catch (err) {
      alert('Login failed'); console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: '16px 0' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        <button type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </div>
    </form>
  )
}
