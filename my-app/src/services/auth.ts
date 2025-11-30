export interface AuthUser { id?: string; email?: string; name?: string }
export interface AuthPayload { token?: string; user?: AuthUser }

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'user_token'

export async function login(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  if (!res.ok) throw new Error('Failed to login')
  const payload = await res.json()
  if (payload.token) {
    localStorage.setItem(TOKEN_KEY, payload.token)
  }
  return payload
}

export async function register(email: string, password: string, name?: string): Promise<AuthPayload> {
  const res = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.error || 'Failed to register')
  }
  const payload = await res.json()
  if (payload.token) localStorage.setItem(TOKEN_KEY, payload.token)
  return payload
}

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function logout() { localStorage.removeItem(TOKEN_KEY) }

export async function me(): Promise<AuthPayload | null> {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return await res.json()
}
