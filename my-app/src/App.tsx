import ProfileHeader from '@components/features/ProfileHeader'
import LinksList from '@components/features/LinksList'
import Offers from '@components/features/Offers'
import BookingCalendar from '@components/features/BookingCalendar'
import Home from './pages/Home'
import AdminPage from './pages/Admin'
import { FREELANCERS } from './data/freelancers'
import { useState, useEffect } from 'react'
import type { Freelancer } from './data/freelancers'
// login page imports
import LoginPage from './pages/Login'
import type { AuthPayload } from './services/auth'
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
  const [loginNext, setLoginNext] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [headerModalOpen, setHeaderModalOpen] = useState(false)
  const [headerModalNext, setHeaderModalNext] = useState<string | null>(null)

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

  function openHeaderLogin(next?: string | null) {
    setHeaderModalNext(next ?? null)
    setHeaderModalOpen(true)
    // Keep loginNext for page flows as well
    setLoginNext(next ?? null)
  }
  function closeHeaderLogin() {
    setHeaderModalOpen(false)
    setHeaderModalNext(null)
  }

  // prevent background scroll when header modal is open
  useEffect(() => {
    if (headerModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [headerModalOpen])

  // derive a small live message for screen readers instead of setState in effect
  const liveMessage = headerModalOpen ? 'Login dialog ouvert' : null

  function handleLogin(payload: AuthPayload) {
    setUserAuth(payload?.user ?? null)
    if (loginNext) {
      setSelected(loginNext)
      setLoginNext(null)
    } else {
      setSelected(null)
    }
    // close any open header modal
    if (headerModalOpen) {
      setHeaderModalOpen(false)
      setHeaderModalNext(null)
    }
    // show a short toast message showing redirect target
    if (payload?.user && loginNext) {
      const found = FREELANCERS.find((f) => f.id === loginNext)
      if (found) {
        setToast(`Redirection vers ${found.name} en cours...`)
        setTimeout(() => setToast(null), 3000)
      }
    }
  }

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
        <div className="app-card" aria-hidden={headerModalOpen}>
          <Header theme={theme} onToggle={(t: 'light' | 'dark') => setTheme(t)} userAuth={userAuth} onLogin={handleLogin} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} onOpenLogin={(next?: string | null) => { setLoginNext(next ?? null); setSelected('login') }} openModal={headerModalOpen} modalNextFromApp={headerModalNext} onModalClose={closeHeaderLogin} />
          <Home onSelect={(id) => setSelected(id)} onOpenLogin={openHeaderLogin} userAuth={userAuth} />
          <Footer />
        </div>
        {toast && <div className="toast">{toast}</div>}
        {liveMessage && <div aria-live="polite" className="sr-only">{liveMessage}</div>}
      </div>
    )
  }

  if (selected === 'admin') {
    
    return (
      <div className="app-shell">
        <div className="app-card">
          <Header theme={theme} onToggle={(t:'light' | 'dark')=>setTheme(t)} userAuth={userAuth} onLogin={handleLogin} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} openModal={headerModalOpen} modalNextFromApp={headerModalNext} onModalClose={closeHeaderLogin} />
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
          <Header theme={theme} onToggle={(t:'light' | 'dark')=>setTheme(t)} userAuth={userAuth} onLogin={handleLogin} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} onOpenLogin={(next?: string | null) => { setLoginNext(next ?? null); setSelected('login') }} openModal={headerModalOpen} modalNextFromApp={headerModalNext} onModalClose={closeHeaderLogin} />
          <LoginPage onLogin={(u) => { setUserAuth(u.user ?? null); if (loginNext) { setSelected(loginNext); setLoginNext(null) } else { setSelected(null) } }} onCancel={() => { setSelected(null); setLoginNext(null) }} next={loginNext ?? undefined} />
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header theme={theme} title={current?.name ?? undefined} onToggle={(t) => setTheme(t)} userAuth={userAuth} onLogin={handleLogin} onLogout={()=>{userLogout(); setUserAuth(null)}} onOpenAdmin={(v)=>setSelected(v)} openModal={headerModalOpen} modalNextFromApp={headerModalNext} onModalClose={closeHeaderLogin} />
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
