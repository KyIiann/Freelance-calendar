import React from 'react'
import { FREELANCERS } from '../data/freelancers'
import './Home.css'

interface Props {
  onSelect: (id: string) => void
}

export default function Home({ onSelect }: Props) {
  return (
    <div className="landing">
      <h1>Choisis ton freelance</h1>
      <p className="intro">Sélectionne un profil pour voir ses liens et réserver un créneau</p>

      <div className="freelancer-grid">
        {FREELANCERS.map((f) => (
          <div key={f.id} className="freelancer-card">
            <div className="meta">
              <div className="avatar-placeholder" />
              <div>
                <div className="name">{f.name}</div>
                <div className="role">{f.role}</div>
              </div>
            </div>
            <p>{f.bio}</p>
            <div className="actions">
              <button onClick={() => onSelect(f.id)}>Voir le profil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
