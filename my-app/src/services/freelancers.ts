export interface FreelancerPayload {
  id?: string
  name: string
  role?: string
  bio?: string
  email?: string
  avatar_url?: string
  links?: { label: string; href: string }[]
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function getFreelancers() {
  const res = await fetch(`${API}/api/freelancers`)
  if (!res.ok) throw new Error('Failed to load freelancers')
  return await res.json()
}

export async function createFreelancer(payload: FreelancerPayload) {
  const headers: any = { 'Content-Type': 'application/json' }
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${API}/api/freelancers`, { method: 'POST', headers, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to create freelancer')
  return await res.json()
}

export async function updateFreelancer(id: string, payload: FreelancerPayload) {
  const headers: any = { 'Content-Type': 'application/json' }
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${API}/api/freelancers/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to update freelancer')
  return await res.json()
}

export async function deleteFreelancer(id: string) {
  const headers: any = {}
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${API}/api/freelancers/${id}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error('Failed to delete freelancer')
  return await res.json()
}

export async function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('avatar', file)
  const headers: any = {}
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${API}/api/freelancers/upload`, { method: 'POST', body: form, headers })
  if (!res.ok) throw new Error('Failed to upload')
  return await res.json()
}
