import ProfileHeader from '../components/features/ProfileHeader'
import LinksList from '../components/features/LinksList'
import BookingCalendar from '../components/features/BookingCalendar'
import './App.css'

function App() {
  return (
    <div style={{maxWidth: 900, margin: '24px auto', background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden'}}>
      <ProfileHeader name="Marie Dupont" role="Développeuse front" bio="J'aide les startups à construire des interfaces accessibles et rapides." />
      <div style={{display: 'flex', gap: 24}}>
        <aside style={{width: 260, borderRight: '1px solid rgba(255,255,255,0.04)'}}>
          <LinksList />
        </aside>
        <main style={{flex: 1}}>
          <BookingCalendar />
        </main>
      </div>
    </div>
  )
}

export default App
