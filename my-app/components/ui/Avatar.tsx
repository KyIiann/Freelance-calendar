// React import not needed with JSX automatic runtime (react-jsx)
import './avatar.css'

interface Props { name: string; photoUrl?: string; size?: number }

function initialsOf(name: string) {
  return name.split(' ').map(s => s[0].toUpperCase()).slice(0, 2).join('')
}

export default function Avatar({ name, photoUrl, size = 64 }: Props) {
  if (photoUrl) return <img className="avatar" src={photoUrl} alt={`${name} avatar`} style={{ width: size, height: size }} />
  return <div className="avatar avatar-fallback" style={{ width: size, height: size }}>{initialsOf(name)}</div>
}
