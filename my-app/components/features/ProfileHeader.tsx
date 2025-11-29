import React from 'react'
import './ProfileHeader.css'
import Avatar from '../ui/Avatar'

interface Props {
  photoUrl?: string
  name: string
  role: string
  bio?: string
  links?: { label: string; href: string }[]
  offers?: { title: string; price?: string; description?: string }[]
}

export default function ProfileHeader({ photoUrl, name, role, bio, links, offers }: Props) {
  const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
      <rect width='100%' height='100%' fill='%23e5e7eb'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14'>Avatar</text>
    </svg>`)

  return (
    <header className="profile">
      <Avatar name={name} photoUrl={photoUrl} size={92} />
      <div className="profile-meta">
        <h1>{name}</h1>
        <div className="role">{role}</div>
        {bio && <p>{bio}</p>}
        {links && links.length > 0 && (
          <div className="header-links">
            {links.slice(0, 4).map((l) => (
              <a key={l.href} href={l.href} {...(l.href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })} className="small-link">
                {(() => {
                  if (l.href.includes('linkedin.com')) return '🔗'
                  if (l.href.includes('github.com')) return '🐙'
                  if (l.href.includes('dribbble.com')) return '🎨'
                  if (l.href.includes('behance.net')) return '🎨'
                  if (l.href.includes('malt.')) return '💼'
                  if (l.href.startsWith('#')) return '📑'
                  return '🔗'
                })()} {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
