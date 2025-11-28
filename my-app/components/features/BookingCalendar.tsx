import { useMemo, useState, useEffect } from 'react'
import { fetchBookingsForDate } from '../../services/bookings'
import BookingForm from './BookingForm'
import './BookingCalendar.css'

function buildSlots(start = 9, end = 17, stepMinutes = 30) {
  const slots: string[] = []
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

interface Props { freelancerId?: string; freelancerName?: string }
export default function BookingCalendar({ freelancerId, freelancerName }: Props) {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const defaultDate = `${yyyy}-${mm}-${dd}`

  const [date, setDate] = useState<string>(defaultDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookings, setBookings] = useState<{ time: string }[]>([])
  // messages are shown by BookingForm; no local message here

  const slots = useMemo(() => buildSlots(), [])
  function getWeekDates(days = 7) {
    const base = new Date()
    const arr: { label: string; value: string }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(base.getTime())
      d.setDate(base.getDate() + i)
      const yyyy = String(d.getFullYear())
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      arr.push({ label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }), value: `${yyyy}-${mm}-${dd}` })
    }
    return arr
  }
  async function refreshBookings() {
    try {
      const b = await fetchBookingsForDate(date, freelancerId)
      setBookings(b)
    } catch {
      setBookings([])
    }
  }

  useEffect(() => { refreshBookings().catch(() => null) }, [date])

  // Booking is now handled by BookingForm. Bookings for the selected date are
  // refreshed via fetchBookingsForDate whenever the date changes.

  return (
    <section className="booking">
      <h2>Réserver un créneau</h2>
      <label className="date-row">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {getWeekDates(7).map((d) => (
            <button key={d.value} type="button" onClick={() => setDate(d.value)} className={d.value === date ? 'slot selected' : 'slot'} style={{ padding: '6px 10px' }}>{d.label}</button>
          ))}
        </div>
      </div>

      <div className="grid">
        <div className="aside">
          <h3>Créneaux disponibles</h3>
          <div className="slots">
            {slots.map((s) => {
              const taken = bookings.some(b => b.time === s)
              const classes = ['slot', taken ? 'taken' : '', selectedTime === s ? 'selected' : ''].filter(Boolean).join(' ')
              return (
                <button key={s} type="button" className={classes} onClick={() => !taken && setSelectedTime(s)} disabled={taken}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="form">
            <h3>Formulaire</h3>
            {selectedTime ? (
              <BookingForm date={date} time={selectedTime} onSuccess={() => { setSelectedTime(null); refreshBookings() }} freelancerId={freelancerId} freelancerName={freelancerName} />
            ) : (
              <div>Veuillez sélectionner un créneau pour afficher le formulaire.</div>
            )}
            {/* Messages and confirmation are handled by the BookingForm component */}
          </div>
      </div>
    </section>
  )
}
