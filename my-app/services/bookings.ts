export interface Booking {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
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

export function getBookingsForDate(date: string): Booking[] {
  return readAll().filter(b => b.date === date)
}

export function createBooking(payload: Omit<Booking, 'id' | 'createdAt'>) {
  const bookings = readAll()
  const id = String(Date.now())
  const createdAt = new Date().toISOString()
  const booking: Booking = { id, createdAt, ...payload }
  bookings.push(booking)
  writeAll(bookings)
  // simulate email send by logging
  console.info('Booking created; would send confirmation email to', booking.email)
  return booking
}

export function isSlotTaken(date: string, time: string) {
  return getBookingsForDate(date).some(b => b.time === time)
}
