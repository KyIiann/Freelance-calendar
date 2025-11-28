import React from 'react'
import './Offers.css'

interface Offer { title: string; price?: string; description?: string }

interface Props { offers?: Offer[] }

export default function Offers({ offers }: Props) {
  if (!offers || offers.length === 0) return null
  return (
    <section id="offers" className="offers">
      <h3>Offres & Tarifs</h3>
      <div className="list">
        {offers.map((o, idx) => (
          <div key={idx} className="item">
            <div className="row">
              <strong>{o.title}</strong>
              {o.price && <span className="text-muted">{o.price}</span>}
            </div>
            {o.description && <p className="text-muted">{o.description}</p>}
            <div className="cta">
              <button type="button" onClick={() => { const el = document.getElementById('booking-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}>Réserver</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
