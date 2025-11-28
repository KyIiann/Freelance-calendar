import ProfileHeader from '../components/features/ProfileHeader'
import LinksList from '../components/features/LinksList'
import Offers from '../components/features/Offers'
import BookingCalendar from '../components/features/BookingCalendar'
import Home from './pages/Home'
import { FREELANCERS } from './data/freelancers'
import { useState, useEffect } from 'react'
import ThemeToggle from '../components/ui/ThemeToggle'
import './App.css'

function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  const current = selected ? FREELANCERS.find(f => f.id === selected) : null

  useEffect(() => {
    if (theme) {
      document.body.dataset.theme = theme
      try { localStorage.setItem('theme', theme) } catch (e) {}
    }
  }, [theme])

  if (!current) {
    return (
      <div className="app-shell">
        <div className="app-card">
          <div className="app-header">
            <div className="header-left">
              <h2>Freelances</h2>
            </div>
            <div className="header-right">
              <ThemeToggle theme={theme} onToggle={(t) => setTheme(t)} />
            </div>
          </div>
          <Home onSelect={(id) => setSelected(id)} />
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
            <h2>{current.name}</h2>
          </div>
          <div className="header-right">
            <ThemeToggle theme={theme} onToggle={(t) => setTheme(t)} />
          </div>
        </div>
        <ProfileHeader name={current.name} role={current.role} photoUrl={current.photoUrl} bio={current.bio} links={current.links} offers={current.offers} />
        <div className="app-inner">
          <aside>
            <div className="card-compact">
              <LinksList links={current.links} />
            </div>
          </aside>
          <main>
            <div className="card-compact">
              <BookingCalendar freelancerId={current.id} freelancerName={current.name} />
              <div className="offers-wrapper">
                <Offers offers={current.offers} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
