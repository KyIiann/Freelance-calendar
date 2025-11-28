import './LinksList.css'

interface LinkItem {
  label: string
  href: string
}

interface Props {
  links?: LinkItem[]
}

function iconFor(href: string) {
  if (href.includes('linkedin.com')) return '🔗'
  if (href.includes('github.com')) return '🐙'
  if (href.includes('dribbble.com')) return '🎨'
  if (href.includes('behance.net')) return '🎨'
  if (href.includes('malt.')) return '💼'
  if (href.startsWith('#')) return '📑'
  return '🔗'
}

export default function LinksList({ links }: Props) {
  const defaultLinks: LinkItem[] = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Malt', href: 'https://www.malt.fr' },
    { label: 'Offres', href: '#offers' },
  ]

  const list = links && links.length ? links : defaultLinks

  return (
    <nav className="links">
      {list.map((l) => (
        <a key={l.href} href={l.href} {...(l.href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}>
          <span style={{ marginRight: 8 }} aria-hidden>{iconFor(l.href)}</span>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
