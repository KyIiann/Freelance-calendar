// React import not needed with JSX automatic runtime (react-jsx)
import './ProfileHeader.css'
import Avatar from '../ui/Avatar'

interface Props {
  photoUrl?: string
  name: string
  role: string
  bio?: string
  links?: { label: string; href: string }[]
}

export default function ProfileHeader({ photoUrl, name, role, bio, links }: Props) {

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
