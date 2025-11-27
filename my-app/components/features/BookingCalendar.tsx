import React, { useMemo, useState } from 'react'
import { createBooking, getBookingsForDate, isSlotTaken } from '../../services/bookings'

function buildSlots(start = 9, end = 17, stepMinutes = 30) {
  const slots: string[] = []
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

export default function BookingCalendar() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const defaultDate = `${yyyy}-${mm}-${dd}`

  const [date, setDate] = useState<string>(defaultDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [message, setMessage] = useState<string | null>(null)

  const slots = useMemo(() => buildSlots(), [])
  const bookings = useMemo(() => getBookingsForDate(date), [date])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTime) {
      setMessage('Veuillez choisir un créneau')
      return
    }
    if (!form.name || !form.email) {
      setMessage('Nom et email requis')
      return
    }
    if (isSlotTaken(date, selectedTime)) {
      setMessage('Désolé, ce créneau est déjà pris')
      return
    }
    createBooking({ name: form.name, email: form.email, phone: form.phone, company: form.company, date, time: selectedTime })
    setMessage('Réservation confirmée — un email de confirmation serait envoyé.')
    setForm({ name: '', email: '', phone: '', company: '' })
    setSelectedTime(null)
  }

  return (
    <section style={{padding: 16}}>
      <h2>Réserver un créneau</h2>
      <label style={{display: 'block', marginBottom: 8}}>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{marginLeft: 8}} />
      </label>

      <div style={{display: 'flex', gap: 16}}>
        <div style={{minWidth: 220}}>
          <h3>Créneaux disponibles</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
            {slots.map((s) => {
              const taken = bookings.some(b => b.time === s)
              return (
                <button key={s} type="button" onClick={() => !taken && setSelectedTime(s)} style={{padding: 8, borderRadius: 6, background: selectedTime === s ? '#2563eb' : taken ? '#9ca3af' : '#111827', color: '#fff', border: 'none'}} disabled={taken}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
          <h3>Vos coordonnées</h3>
          <input placeholder="Prénom et nom" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <input placeholder="Société (optionnel)" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
            <div>Créneau choisi: <strong>{selectedTime || '—'}</strong></div>
            <button type="submit" style={{marginLeft: 'auto'}}>Réserver</button>
          </div>
          {message && <div style={{marginTop: 8, color: '#064e3b'}}>{message}</div>}
        </form>
      </div>
    </section>
  )
}
