import React from 'react'
import { FREELANCERS } from '../data/freelancers'
import type { Freelancer } from '../data/freelancers'
import { getFreelancers } from '../services/freelancers'
import './Home.css'
import Avatar from '@components/ui/Avatar'

interface Props {
  onSelect: (id: string) => void
  onOpenLogin?: (next?: string | null) => void
  userAuth?: { id?: string; name?: string; email?: string } | null
}

export default function Home({ onSelect, onOpenLogin, userAuth }: Props) {
  const [list, setList] = React.useState<Freelancer[]>(FREELANCERS)

  React.useEffect(() => {
    let mounted = true
    getFreelancers().then((f) => { if (mounted) setList(f) }).catch(() => { /*fallback to mock*/ })
    return () => { mounted = false }
  }, [])
  return (
    <div className="landing">
      <h1>Choisis ton freelance</h1>
      <p className="intro">Sélectionne un profil pour voir ses liens et réserver un créneau</p>

      <div className="freelancer-grid">
        {list.map((f) => (
          <div key={f.id} className="freelancer-card">
            <div className="meta">
              <div className="avatar-placeholder">
                <Avatar name={f.name} photoUrl={f.photoUrl} size={64} />
              </div>
              <div>
                <div className="name">{f.name}</div>
                <div className="role">{f.role}</div>
              </div>
            </div>
            <p>{f.bio}</p>
              <div className="actions">
              <button onClick={() => {
                if (!userAuth && onOpenLogin) {
                  // prefer opening header modal (fast) — call App to open header modal
                  onOpenLogin(f.id)
                } else {
                  onSelect(f.id)
                }
              }}>Voir le profil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
