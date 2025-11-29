const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'admin_token'

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  if (!res.ok) throw new Error('Failed to login')
  const payload = await res.json()
  if (payload.token) {
    localStorage.setItem(TOKEN_KEY, payload.token)
  }
  return payload
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function me() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return null
  return await res.json()
}
