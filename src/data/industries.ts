export type Industry = {
  index: string
  name: string
  shortName: string
  href: string
  description: string
  capabilities: string[]
  accent: string
}

export const industries: Industry[] = [
  {
    index: '01',
    name: 'TECHNOLOGY',
    shortName: 'TECH',
    href: '#industries',
    description: 'Digital products, platforms and systems built to scale.',
    capabilities: ['Web Applications', 'SaaS Platforms', 'API Systems', 'Cloud Infrastructure', 'Custom Software'],
    accent: '#D4D4D4',
  },
  {
    index: '02',
    name: 'REAL ESTATE',
    shortName: 'REAL ESTATE',
    href: '#industries',
    description: 'Property platforms and digital experiences that move inventory.',
    capabilities: ['Property Portals', 'Virtual Tours', 'Lead Systems', 'CRM Integration', 'Marketing Funnels'],
    accent: '#C0C0C0',
  },
  {
    index: '03',
    name: 'AUTOMOBILE',
    shortName: 'AUTO',
    href: '#industries',
    description: 'Showroom-to-sale digital systems for modern dealerships.',
    capabilities: ['Inventory Platforms', '3D Configurators', 'Lead Management', 'AR Experiences', 'Digital Showrooms'],
    accent: '#ABABAB',
  },
  {
    index: '04',
    name: 'DIGITAL ASSETS',
    shortName: 'DIGITAL',
    href: '#industries',
    description: 'Commerce and asset management platforms for the digital economy.',
    capabilities: ['E-Commerce', 'Digital Storefronts', 'Payment Systems', 'Asset Management', 'Growth Funnels'],
    accent: '#969696',
  },
  {
    index: '05',
    name: 'MEDIA & CREATIVE',
    shortName: 'MEDIA',
    href: '#industries',
    description: 'Brand experiences and creative platforms that capture attention.',
    capabilities: ['Brand Systems', 'Content Platforms', 'Creative Direction', 'Immersive Experiences', 'Campaign Systems'],
    accent: '#818181',
  },
  {
    index: '06',
    name: 'ELECTRONICS',
    shortName: 'ELECTRONICS',
    href: '#industries',
    description: 'Digital retail and product platforms for electronics businesses.',
    capabilities: ['Product Catalogues', 'E-Commerce Systems', 'Comparison Tools', 'Technical Documentation', 'Customer Portals'],
    accent: '#6C6C6C',
  },
  {
    index: '07',
    name: 'RETAIL',
    shortName: 'RETAIL',
    href: '#industries',
    description: 'End-to-end retail platforms connecting physical and digital.',
    capabilities: ['Omnichannel Commerce', 'Inventory Management', 'Loyalty Systems', 'Digital Menus', 'POS Integration'],
    accent: '#575757',
  },
]
