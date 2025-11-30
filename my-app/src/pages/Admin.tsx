import React from 'react'
import { adminListBookings, deleteBooking } from '../services/bookings'
import type { Booking } from '../services/bookings'
import { getFreelancers, uploadAvatar, updateFreelancer } from '../services/freelancers'
import type { FreelancerPayload } from '../services/freelancers'
import AdminLogin from '@components/ui/AdminLogin'
import LoginRegister from '@components/ui/LoginRegister'
import { me as userMe, logout as userLogout } from '../services/auth'
import type { AuthPayload } from '../services/auth'
import { me, logout } from '../services/admin'

export default function Admin() {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [freelancers, setFreelancers] = React.useState<FreelancerPayload[]>([])
  const [auth, setAuth] = React.useState<{ id?: string; name?: string; email?: string } | null>(null)
  const [userAuth, setUserAuth] = React.useState<{ id?: string; name?: string; email?: string } | null>(null)

  async function fetchAdmin() {
    try {
      const list = await adminListBookings()
      setBookings(list)
    } catch (e) { console.error(e) }
  }

  async function fetchFreelancers() {
    try { const f = await getFreelancers(); setFreelancers(f) } catch (err) { console.error(err) }
  }

  React.useEffect(() => { (async () => { const u = await me(); setAuth(u?.user ?? null); if (u?.user) { await fetchAdmin(); await fetchFreelancers() } const uu = await userMe(); setUserAuth(uu?.user ?? null) })() }, [])

  

  async function onDelete(id: string) {
    if (!confirm('Supprimer cette réservation ?')) return
    await deleteBooking(id)
    await fetchAdmin()
  }

  async function handleAvatarUpload(file: File, id: string) {
    try {
      const r = await uploadAvatar(file)
        const f = freelancers.find(x => String(x.id) === String(id))
        await updateFreelancer(String(id), { avatar_url: r.url, name: f?.name ?? '—' })
      fetchFreelancers()
    } catch (e) { console.error(e); alert('Upload failed') }
  }

  function onLoginDone() {
    (async () => {
      const u = await me(); setAuth(u?.user ?? null); await fetchAdmin(); await fetchFreelancers()
    })()
  }

  function onUserLogin(payload: AuthPayload) {
    // payload includes token and user info for client; set local state to payload.user
    setUserAuth(payload.user ?? null)
  }

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — réservations</h1>
      {auth ? <div style={{ marginBottom: 12 }}>Connecté en tant que <strong>{auth.name || auth.email}</strong> — <button onClick={() => { logout(); setAuth(null) }}>Déconnexion</button></div> : null}
      {!auth && <AdminLogin onSuccess={onLoginDone} />}
      {!userAuth && <div style={{ marginTop: 8 }}><strong>Client login</strong><LoginRegister onLogin={(u) => onUserLogin(u)} /></div>}
      {userAuth && <div style={{ marginTop: 8 }}>Connecté en tant que <strong>{userAuth.name || userAuth.email}</strong> — <button onClick={() => { userLogout(); setUserAuth(null) }}>Déconnexion</button></div>}
      {auth ? (
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr><th>ID</th><th>Freelancer</th><th>Start</th><th>Dur</th><th>Name</th><th>Email</th><th>Phone</th><th></th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.freelancer}</td>
              <td>{b.start_ts}</td>
              <td>{b.duration_minutes}</td>
              <td>{b.cancel_token ? <a href={`${API}/api/bookings/cancel/${b.cancel_token}`} target="_blank" rel="noreferrer">Annuler (link)</a> : '—'}</td>
              <td>{b.firstname ?? b.name}</td>
              <td>{b.email}</td>
              <td>{b.phone}</td>
              <td><button onClick={() => onDelete(b.id)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      ) : (<div style={{ padding: 12 }}>Connectez-vous pour voir et gérer les réservations.</div>)}
      {auth && (
        <div style={{ display: 'grid', gap: 8 }}>
          {freelancers.map((f) => (
            <div key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <img src={(f.avatar_url || '/assets/avatars/marie.svg')} width={40} height={40} style={{ borderRadius: 8 }} />
              <div style={{ flex: 1 }}>{f.name} — {f.role}</div>
              <div>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && e.target.files.length && handleAvatarUpload(e.target.files[0], String(f.id))} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
