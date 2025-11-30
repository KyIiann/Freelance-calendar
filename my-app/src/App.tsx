import ProfileHeader from '@components/features/ProfileHeader'
import LinksList from '@components/features/LinksList'
import Offers from '@components/features/Offers'
import BookingCalendar from '@components/features/BookingCalendar'
import Home from './pages/Home'
import AdminPage from './pages/Admin'
import { FREELANCERS } from './data/freelancers'
import { useState, useEffect } from 'react'
import type { Freelancer } from './data/freelancers'
import ThemeToggle from '@components/ui/ThemeToggle'
import LoginRegister from '@components/ui/LoginRegister'
import Header from '@components/ui/Header'
import Footer from '@components/ui/Footer'
import { me as userMe, logout as userLogout } from './services/auth'
import './App.css'
import { getFreelancer } from './services/freelancers'

function App() {
  const [selected, setSelected] = useState<string | null>(null)
  // support admin mode via special selected value 'admin'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch (err) { console.warn(err) }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  const [current, setCurrent] = useState<Freelancer | null>(null)
  const [userAuth, setUserAuth] = useState<{ id?: string; name?: string; email?: string } | null>(null)

  useEffect(() => {
    if (theme) {
      document.body.dataset.theme = theme
      try { localStorage.setItem('theme', theme) } catch (err) { console.warn(err) }
    }
  }, [theme])

  useEffect(() => {
    (async () => {
      const u = await userMe()
      if (u && u.user) setUserAuth(u.user)
    })()
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadCurrent() {
      if (!selected || selected === 'admin') {
        setCurrent(null)
        return
      }
      try {
        const res = await getFreelancer(selected)
        if (mounted) setCurrent(res)
      } catch (err) {
        console.warn('getFreelancer failed', err)
        const fallback = FREELANCERS.find(f => f.id === selected) || null
        if (mounted) setCurrent(fallback)
      }
    }
    loadCurrent()
    return () => { mounted = false }
  }, [selected])

  if (!current && selected !== 'admin') {
    return (
      <div className="app-shell">
        <div className="app-card">
          <Header theme={theme} onToggle={(t: 'light' | 'dark') => setTheme(t)} userAuth={userAuth} onLogin={(u)=>setUserAuth(u?.user ?? null)} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} />
          <Home onSelect={(id) => setSelected(id)} />
          <Footer />
        </div>
      </div>
    )
  }

  if (selected === 'admin') {
    
    return (
      <div className="app-shell">
        <div className="app-card">
          <Header theme={theme} onToggle={(t:'light' | 'dark')=>setTheme(t)} userAuth={userAuth} onLogin={(u)=>setUserAuth(u?.user ?? null)} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} />
          <AdminPage />
          <Footer />
        </div>
      </div>
    )
  }

  if (selected === 'login') {
    return (
      <div className="app-shell">
        <div className="app-card">
          <Header theme={theme} onToggle={(t:'light' | 'dark')=>setTheme(t)} userAuth={userAuth} onLogin={(u)=>setUserAuth(u?.user ?? null)} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} />
          <div style={{ padding: 16 }}>
            <LoginRegister onLogin={(u) => { setUserAuth(u.user ?? null); setSelected(null) }} />
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-card">
        <div className="app-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => setSelected(null)}>← Retour</button>
            <h2>{current?.name}</h2>
          </div>
          <div className="header-right">
            <ThemeToggle theme={theme} onToggle={(t) => setTheme(t)} />
            {userAuth ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{userAuth?.name || userAuth?.email}</div>
                <button className="btn-back" onClick={() => { userLogout(); setUserAuth(null) }}>Logout</button>
              </div>
            ) : (
              <button className="btn-back" onClick={() => setSelected('login')}>Login</button>
            )}
            <button className="btn-back" onClick={() => setSelected('admin')}>Admin</button>
          </div>
        </div>
        <ProfileHeader name={current?.name ?? '—'} role={current?.role ?? '—'} photoUrl={current?.avatar_url ?? current?.photoUrl} bio={current?.bio} links={current?.links} />
        <div className="app-inner">
          <aside>
              <div className="card-compact">
                <LinksList links={current?.links} />
            </div>
          </aside>
          <main>
            <div className="card-compact">
              <BookingCalendar freelancerId={current?.id ?? undefined} freelancerName={current?.name ?? undefined} />
              <div className="offers-wrapper">
                <Offers offers={current?.offers ?? []} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
