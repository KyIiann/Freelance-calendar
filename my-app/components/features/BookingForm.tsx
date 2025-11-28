import React, { useState } from 'react'
import { createBooking } from '../../services/bookings'
import './BookingForm.css'

interface Props {
  date: string
  time: string
  freelancerId?: string
  freelancerName?: string
  onSuccess?: () => void
}

export default function BookingForm({ date, time, onSuccess }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!form.name || !form.email || !form.phone) {
      setMessage('Nom, email et téléphone requis')
      return
    }
    setBusy(true)
    try {
      await createBooking({ name: form.name, email: form.email, phone: form.phone, company: form.company, date, time, freelancer: freelancerId })
      setMessage('Réservation confirmée — un email de confirmation a été envoyé.')
      setForm({ name: '', email: '', phone: '', company: '' })
      if (onSuccess) onSuccess()
    } catch (e: any) {
      console.error('Booking failed', e)
      setMessage(e?.message || 'Impossible de réserver le créneau — réessayez plus tard.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form id="booking-form" onSubmit={handleSubmit} className="booking-form">
      <h3>Vos coordonnées</h3>
      <div className="slot-info">Créneau: <strong>{date} à {time}</strong></div>
      {freelancerName && <div className="text-muted">Réservation pour: <strong>{freelancerName}</strong></div>}
      <input required aria-label="Prénom et nom" placeholder="Prénom et nom" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
      <input required aria-label="Email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
      <input required aria-label="Téléphone" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
      <input aria-label="Société" placeholder="Société (optionnel)" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
      <div className="actions">
        <button type="submit" disabled={busy}>{busy ? 'Envoi...' : 'Confirmer'}</button>
      </div>
      {message && <div className="message">{message}</div>}
    </form>
  )
}
