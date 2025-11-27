interface LinkItem {
  label: string
  href: string
}

interface Props {
  links?: LinkItem[]
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
    <nav style={{display: 'flex', flexDirection: 'column', gap: 8, padding: 16}}>
      {list.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{padding: 12, borderRadius: 8, background: '#111827', color: '#fff', textDecoration: 'none', display: 'inline-block'}}>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
