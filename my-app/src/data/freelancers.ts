export interface Freelancer {
  id: string
  name: string
  role: string
  bio?: string
  photoUrl?: string
  links?: { label: string; href: string }[]
}

export const FREELANCERS: Freelancer[] = [
  {
    id: 'marie',
    name: 'Marie Dupont',
    role: 'Développeuse front',
    bio: "J'aide les startups à construire des interfaces accessibles et rapides.",
    photoUrl: '/assets/avatars/marie.svg',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Offres', href: '#offers' },
    ],
    offers: [
      { title: 'Audit Front', price: '250€', description: 'Audit de performance et accessibilité (1h)' },
      { title: 'Développement UI', price: '600€ / jour', description: 'Design et développement d’interfaces React' },
    ],
  },
  {
    id: 'jean',
    name: 'Jean Dupont',
    role: 'Design & UX',
    bio: 'Designer freelance spécialisé en UX pour produit SaaS.',
    photoUrl: '/assets/avatars/jean.svg',
    links: [
      { label: 'Dribbble', href: 'https://dribbble.com' },
      { label: 'Behance', href: 'https://behance.net' },
      { label: 'Offres', href: '#offers' },
    ],
    offers: [
      { title: 'Brand kit', price: '1200€', description: 'Logo, palette et guideline (1-2 semaines)' },
    ],
  },
  {
    id: 'sam',
    name: 'Sam Leclerc',
    role: 'Full-stack',
    bio: 'Node.js / React / PostgreSQL',
    photoUrl: '/assets/avatars/sam.svg',
    links: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Offres', href: '#offers' },
    ],
    offers: [
      { title: 'MVP Full-stack', price: '800€ / jour', description: 'Prototype fonctionnel avec React + Node' },
    ],
  },
]
