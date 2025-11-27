import React from 'react'

interface Props {
  photoUrl?: string
  name: string
  role: string
  bio?: string
}

export default function ProfileHeader({ photoUrl, name, role, bio }: Props) {
  const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
      <rect width='100%' height='100%' fill='%23e5e7eb'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14'>Avatar</text>
    </svg>`)

  return (
    <header style={{display: 'flex', gap: 16, alignItems: 'center', padding: 16}}>
      <img
        src={photoUrl || DEFAULT_AVATAR}
        alt={`${name} avatar`}
        width={100}
        height={100}
        style={{borderRadius: 12, objectFit: 'cover', flex: '0 0 100px'}}
      />
      <div>
        <h1 style={{margin: 0}}>{name}</h1>
        <div style={{color: '#6b7280', margin: '6px 0'}}>{role}</div>
        {bio && <p style={{margin: 0, maxWidth: 520}}>{bio}</p>}
      </div>
    </header>
  )
}
