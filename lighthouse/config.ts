export const runsPerTarget = 3

export const previewPort = 4174

export const pages = [
  { id: 'inicio', label: 'Início', path: '/' },
  {
    id: 'detalhe',
    label: 'Detalhe do NFT',
    path: '/nft/emerald-ape-042?edition=emerald-ape-042--1-50',
  },
] as const

export const profiles = ['mobile', 'desktop'] as const

export const categories = ['performance', 'accessibility', 'best-practices', 'seo'] as const

export const targets: Record<(typeof categories)[number], number> = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 90,
}

export const metrics = [
  { id: 'largest-contentful-paint', label: 'LCP', unit: 'ms' },
  { id: 'cumulative-layout-shift', label: 'CLS', unit: '' },
  { id: 'total-blocking-time', label: 'TBT', unit: 'ms' },
  { id: 'first-contentful-paint', label: 'FCP', unit: 'ms' },
  { id: 'speed-index', label: 'Speed Index', unit: 'ms' },
] as const

export const chromeFlags = ['--no-sandbox', '--disable-gpu']
