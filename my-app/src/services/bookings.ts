export interface Booking {
  id: string
  name: string
  firstname?: string
  email: string
  phone?: string
  company?: string
  freelancer?: string
  start_ts: string // ISO timestamp
  duration_minutes: number
  createdAt: string
  cancel_token?: string
}

const STORAGE_KEY = 'bookings'

function readAll(): Booking[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Booking[]
  } catch (e) {
    console.error('Failed to parse bookings', e)
    return []
  }
}

function writeAll(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

export function getBookingsForDate(date: string, freelancer?: string): Booking[] {
  return readAll().filter(b => {
    const d = new Date(b.start_ts)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    return dateStr === date && (!freelancer || b.freelancer === freelancer)
  })
}

export async function createBooking(payload: Omit<Booking, 'id' | 'createdAt'> & { freelancer?: string }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  try {
    const res = await fetch(`${apiUrl}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname: payload.name, email: payload.email, phone: payload.phone, company: payload.company, start_ts: payload.start_ts, duration_minutes: payload.duration_minutes, freelancer: payload.freelancer })
    })
    if (!res.ok) {
      if (res.status === 409) {
        const err = await res.json()
        throw new Error(err.error || 'Slot already taken')
      }
      throw new Error('Network response not ok')
    }
    const data = await res.json()
    return {
      id: String(data.id),
      name: data.firstname || data.name || '',
      email: data.email,
      phone: data.phone ?? undefined,
      company: data.company ?? undefined,
      freelancer: data.freelancer ?? undefined,
      start_ts: data.start_ts,
      duration_minutes: data.duration_minutes ?? 30,
      createdAt: data.created_at || new Date().toISOString(),
      cancel_token: data.cancel_token ?? undefined,
    } as Booking
  } catch (err) {
    const bookings = readAll()
    const id = String(Date.now())
    const createdAt = new Date().toISOString()
    const booking: Booking = { id, createdAt, ...payload }
    bookings.push(booking)
    writeAll(bookings)
    console.info('Booking created locally; server not reachable. Send confirmation email to', booking.email)
    console.warn('createBooking: failed to reach server, saved locally', err)
    return booking
  }
}

export async function fetchBookingsForDate(date: string, freelancer?: string): Promise<Booking[]> {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  try {
    const params = new URLSearchParams({ date })
    if (freelancer) params.set('freelancer', freelancer)
    const res = await fetch(`${apiUrl}/api/bookings?${params.toString()}`)
    if (!res.ok) throw new Error('Network response not ok')
    const payload = await res.json()
    if (!Array.isArray(payload)) return []
    return (payload as unknown[]).map((r) => {
      const obj = r as Record<string, unknown>
      return {
        id: (obj.id as unknown)?.toString?.() ?? String(Date.now()),
        name: (obj.firstname as string) || (obj.name as string) || '',
        email: obj.email as string,
        phone: (obj.phone as string) ?? undefined,
        company: (obj.company as string) ?? undefined,
        freelancer: (obj.freelancer as string) ?? undefined,
        start_ts: obj.start_ts as string,
        duration_minutes: (obj.duration_minutes as number) ?? 30,
        createdAt: (obj.created_at as string) || new Date().toISOString(),
        cancel_token: (obj.cancel_token as string) ?? undefined,
      }
    })
  } catch {
    return getBookingsForDate(date, freelancer)
  }
}

export async function adminListBookings() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const headers: Record<string, string> = {}
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${apiUrl}/api/admin/bookings`, { headers })
  if (!res.ok) throw new Error('Failed to fetch bookings')
  return await res.json()
}

export async function deleteBooking(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const headers: Record<string, string> = {}
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  const adminKey = (import.meta.env.VITE_ADMIN_KEY as string) || ''
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`
  else if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`
  const res = await fetch(`${apiUrl}/api/bookings/${id}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error('Failed to delete booking')
  return await res.json()
}

export async function cancelBookingByToken(token: string) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const res = await fetch(`${apiUrl}/api/bookings/cancel/${token}`)
  if (!res.ok) throw new Error('Failed to cancel booking')
  return await res.json()
}

export function isSlotTaken(startTsISO: string, durationMinutes: number, freelancer?: string) {
  const start = new Date(startTsISO).getTime()
  const end = start + durationMinutes * 60 * 1000
  return readAll().some(b => {
    if (freelancer && b.freelancer !== freelancer) return false
    const bStart = new Date(b.start_ts).getTime()
    const bEnd = bStart + (b.duration_minutes ?? 30) * 60 * 1000
    return (bStart < end) && (bEnd > start)
  })
}
