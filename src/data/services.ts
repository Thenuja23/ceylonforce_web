export type ServiceItem = {
  number: string
  title: string
  description: string
  capabilities: string[]
  accent: string
}

export const services: ServiceItem[] = [
  {
    number: '01',
    title: 'BUSINESS\nWEBSITES',
    description: 'High-performance websites designed to turn visitors into customers.',
    capabilities: ['Premium UI/UX', 'Responsive development', 'SEO-ready architecture', 'CMS integration', 'Analytics', 'Conversion optimization'],
    accent: '#d4d4d4',
  },
  {
    number: '02',
    title: 'E-COMMERCE\nSYSTEMS',
    description: 'Conversion-led commerce experiences built for growth and operational clarity.',
    capabilities: ['Store architecture', 'Checkout flows', 'Inventory systems', 'Marketing funnels', 'Performance tracking', 'Scalable frontend'],
    accent: '#b8b8b8',
  },
  {
    number: '03',
    title: 'BUSINESS\nMANAGEMENT\nSYSTEMS',
    description: 'Operational tools that streamline teams, data and day-to-day decisions.',
    capabilities: ['Dashboards', 'Automation', 'CRM workflows', 'Internal tooling', 'Business logic', 'Reporting'],
    accent: '#a0a0a0',
  },
  {
    number: '04',
    title: 'DIGITAL\nMENUS',
    description: 'Immersive menu experiences that elevate hospitality and customer interaction.',
    capabilities: ['Interactive menus', 'Brand storytelling', 'Mobile-first UX', 'Ordering flows', 'Real-time updates', 'Visual merchandising'],
    accent: '#8d8d8d',
  },
  {
    number: '05',
    title: 'AR / VR\nEXPERIENCES',
    description: 'Spatial experiences that turn products, spaces and services into memorable moments.',
    capabilities: ['Immersive prototypes', '3D storytelling', 'Virtual product demos', 'Interactive spaces', 'Showcase experiences', 'Creative direction'],
    accent: '#7a7a7a',
  },
  {
    number: '06',
    title: 'CUSTOM\nSOFTWARE',
    description: 'Tailored digital products engineered for precision, speed and scale.',
    capabilities: ['API systems', 'Custom workflows', 'Integrations', 'Automation', 'Security', 'Maintenance'],
    accent: '#676767',
  },
  {
    number: '07',
    title: 'DIGITAL\nMARKETING\n& GROWTH',
    description: 'Strategy and execution that bring attention, traffic and measurable conversion.',
    capabilities: ['Campaign strategy', 'Performance design', 'Landing pages', 'SEO', 'Analytics', 'Growth testing'],
    accent: '#585858',
  },
  {
    number: '08',
    title: 'AI-POWERED\nSOLUTIONS',
    description: 'Intelligent systems that reduce friction and amplify business performance.',
    capabilities: ['Workflow automation', 'AI UX', 'Smart content', 'Predictive processes', 'Decision support', 'System integration'],
    accent: '#484848',
  },
]
