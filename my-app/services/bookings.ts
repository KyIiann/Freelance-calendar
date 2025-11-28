export interface Booking {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  freelancer?: string
  date: string // yyyy-mm-dd
  time: string // HH:MM
  createdAt: string
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
  return readAll().filter(b => b.date === date && (!freelancer || b.freelancer === freelancer))
}

export async function createBooking(payload: Omit<Booking, 'id' | 'createdAt'> & { freelancer?: string }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  try {
    const res = await fetch(`${apiUrl}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname: payload.name, email: payload.email, phone: payload.phone, company: payload.company, date: payload.date, time: payload.time, freelancer: payload.freelancer })
    })
    if (!res.ok) {
      // 409 conflict: slot already taken
      if (res.status === 409) {
        const payload = await res.json()
        throw new Error(payload.error || 'Slot already taken')
      }
      throw new Error('Network response not ok')
    }
    const payload = await res.json()
    // map server payload to Booking interface
    return {
      id: String(payload.id),
      name: payload.firstname || payload.name || '',
      email: payload.email,
      phone: payload.phone ?? undefined,
      company: payload.company ?? undefined,
      freelancer: payload.freelancer ?? undefined,
      date: (payload.date || date).split('T')[0],
      time: payload.time || payload.time || '00:00',
      createdAt: payload.created_at || new Date().toISOString(),
    } as Booking
  } catch (e) {
    // fallback to client-side storage
    const bookings = readAll()
    const id = String(Date.now())
    const createdAt = new Date().toISOString()
    const booking: Booking = { id, createdAt, ...payload }
    bookings.push(booking)
    writeAll(bookings)
    console.info('Booking created locally; server not reachable. Send confirmation email to', booking.email)
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
    // map server response to our Booking shape when possible
    return (payload as any[]).map((r) => ({
      id: r.id?.toString() ?? String(Date.now()),
      name: r.firstname || r.name || '',
      email: r.email,
      phone: r.phone ?? undefined,
      company: r.company ?? undefined,
      freelancer: r.freelancer ?? undefined,
      date: (r.date || date).split('T')[0],
      time: r.time || r.time || '00:00',
      createdAt: r.created_at || new Date().toISOString(),
    }))
  } catch (e) {
    // fallback
    return getBookingsForDate(date, freelancer)
  }
}

export function isSlotTaken(date: string, time: string, freelancer?: string) {
  return getBookingsForDate(date, freelancer).some(b => b.time === time)
}
