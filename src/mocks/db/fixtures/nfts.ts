import { Big } from 'big.js'
import type {
  CategoryId,
  Edition,
  EditionKind,
  NetworkId,
  NftDetail,
  NftImage,
} from '@/api/contracts'
import { fixtureNow } from '../../config'
import { createRandom } from '../random'

type ArtKey = 'emerald' | 'nomad' | 'baron' | 'golden'

const artAlt: Record<ArtKey, string> = {
  emerald: 'macaco de óculos redondos e jaqueta verde de colégio',
  nomad: 'gorila de chapéu bucket verde e moletom roxo',
  baron: 'macaco de cabelo escuro, gola alta verde e blazer bege',
  golden: 'macaco dourado com fones de ouvido verdes e jaqueta clara',
}

function image(art: ArtKey, name: string): NftImage {
  return {
    alt: `${name}: ${artAlt[art]}`,
    sm: `/nfts/${art}-160.webp`,
    md: `/nfts/${art}-320.webp`,
    lg: `/nfts/${art}-640.webp`,
  }
}

const maxPerOrder: Record<EditionKind, number> = { '1/1': 1, '1/10': 3, '1/50': 10, open: 20 }
const supply: Record<EditionKind, number | null> = { '1/1': 1, '1/10': 10, '1/50': 50, open: null }

function edition(nftId: string, kind: EditionKind, priceEth: string, available: number): Edition {
  return {
    id: `${nftId}--${kind === 'open' ? 'open' : kind.replace('/', '-')}`,
    kind,
    priceEth,
    supply: supply[kind],
    available,
    maxPerOrder: maxPerOrder[kind],
  }
}

function cheapestAvailable(editions: Edition[]): { priceEth: string; available: number } {
  const purchasable = editions.filter((item) => item.available > 0)
  const pool = purchasable.length > 0 ? purchasable : editions
  const cheapest = pool.reduce((min, item) =>
    new Big(item.priceEth).lt(min.priceEth) ? item : min,
  )
  return {
    priceEth: cheapest.priceEth,
    available: editions.reduce((sum, item) => sum + item.available, 0),
  }
}

const collections = [
  { id: 'kurio-apes', name: 'Kurio Apes' },
  { id: 'kurio-editions', name: 'Kurio Editions' },
  { id: 'canopy-club', name: 'Canopy Club' },
  { id: 'jungle-sounds', name: 'Jungle Sounds' },
  { id: 'golden-hour', name: 'Golden Hour Studio' },
] as const

const creators = [
  'Nova Sato',
  'Iris Moreau',
  'Kenji Arai',
  'Lia Duarte',
  'Theo Nakamura',
  'Maya Okafor',
]

const attributePool = [
  'Óculos',
  'Esmeralda',
  'Raro',
  'Chapéu',
  'Moletom',
  'Fones',
  'Dourado',
  'Blazer',
  'Gola alta',
  'Neon',
  'Lendário',
  'Animado',
]

type Seed = {
  id: string
  name: string
  tokenId: string
  art: ArtKey
  collection: (typeof collections)[number]
  category: CategoryId
  network: NetworkId
  editions: Array<[EditionKind, string, number]>
  featured?: boolean
  daysAgo: number
  popularity: number
  attributes: string[]
  creator: string
  rating: { average: number; count: number }
}

const figmaSeeds: Seed[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    tokenId: '#0042',
    art: 'emerald',
    collection: collections[0],
    category: 'arte-digital',
    network: 'ethereum',
    editions: [
      ['1/1', '5.95', 0],
      ['1/10', '2.49', 4],
      ['1/50', '1.19', 18],
      ['open', '1.49', 999],
    ],
    featured: true,
    daysAgo: 3,
    popularity: 980,
    attributes: ['Óculos', 'Esmeralda', 'Raro'],
    creator: 'Nova Sato',
    rating: { average: 4.8, count: 19 },
  },
  {
    id: 'sage-nomad-089',
    name: 'Sage Nomad #089',
    tokenId: '#0089',
    art: 'nomad',
    collection: collections[2],
    category: 'arte-digital',
    network: 'ethereum',
    editions: [
      ['1/10', '3.29', 2],
      ['1/50', '1.69', 21],
    ],
    featured: true,
    daysAgo: 6,
    popularity: 870,
    attributes: ['Chapéu', 'Moletom'],
    creator: 'Iris Moreau',
    rating: { average: 4.6, count: 12 },
  },
  {
    id: 'neon-vessel-552',
    name: 'Neon Vessel #552',
    tokenId: '#0552',
    art: 'baron',
    collection: collections[1],
    category: 'colecionaveis',
    network: 'polygon',
    editions: [
      ['1/1', '6.40', 1],
      ['1/50', '1.89', 9],
    ],
    featured: true,
    daysAgo: 12,
    popularity: 640,
    attributes: ['Blazer', 'Neon'],
    creator: 'Kenji Arai',
    rating: { average: 4.4, count: 8 },
  },
  {
    id: 'cosmic-bloom-118',
    name: 'Cosmic Bloom #118',
    tokenId: '#0118',
    art: 'nomad',
    collection: collections[2],
    category: 'generativo',
    network: 'ethereum',
    editions: [
      ['1/10', '2.79', 6],
      ['1/50', '1.29', 33],
    ],
    daysAgo: 9,
    popularity: 720,
    attributes: ['Chapéu', 'Moletom', 'Animado'],
    creator: 'Lia Duarte',
    rating: { average: 4.5, count: 15 },
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    tokenId: '#0314',
    art: 'nomad',
    collection: collections[2],
    category: 'arte-digital',
    network: 'ethereum',
    editions: [
      ['1/50', '1.39', 40],
      ['open', '1.59', 999],
    ],
    daysAgo: 15,
    popularity: 690,
    attributes: ['Chapéu', 'Moletom'],
    creator: 'Iris Moreau',
    rating: { average: 4.3, count: 11 },
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    tokenId: '#0088',
    art: 'baron',
    collection: collections[0],
    category: 'fotografia',
    network: 'ethereum',
    editions: [
      ['1/1', '7.20', 1],
      ['1/50', '1.79', 27],
    ],
    daysAgo: 21,
    popularity: 610,
    attributes: ['Blazer', 'Gola alta'],
    creator: 'Theo Nakamura',
    rating: { average: 4.7, count: 22 },
  },
  {
    id: 'golden-beat-207',
    name: 'Golden Beat #207',
    tokenId: '#0207',
    art: 'golden',
    collection: collections[3],
    category: 'musica',
    network: 'polygon',
    editions: [
      ['1/10', '1.99', 5],
      ['1/50', '0.99', 44],
    ],
    daysAgo: 25,
    popularity: 560,
    attributes: ['Fones', 'Dourado'],
    creator: 'Maya Okafor',
    rating: { average: 4.2, count: 9 },
  },
  {
    id: 'golden-hour-233',
    name: 'Golden Hour #233',
    tokenId: '#0233',
    art: 'golden',
    collection: collections[4],
    category: 'musica',
    network: 'solana',
    editions: [
      ['1/50', '0.79', 12],
      ['open', '0.59', 999],
    ],
    daysAgo: 40,
    popularity: 410,
    attributes: ['Fones', 'Dourado', 'Animado'],
    creator: 'Maya Okafor',
    rating: { average: 4.1, count: 6 },
  },
  {
    id: 'golden-signal-160',
    name: 'Golden Signal #160',
    tokenId: '#0160',
    art: 'golden',
    collection: collections[3],
    category: 'musica',
    network: 'polygon',
    editions: [
      ['1/1', '2.10', 0],
      ['1/50', '0.39', 3],
    ],
    daysAgo: 48,
    popularity: 380,
    attributes: ['Fones', 'Dourado'],
    creator: 'Maya Okafor',
    rating: { average: 4.0, count: 4 },
  },
]

const adjectives = [
  'Amber',
  'Cobalt',
  'Crimson',
  'Dusk',
  'Ember',
  'Frost',
  'Jade',
  'Lunar',
  'Onyx',
  'Rust',
  'Saffron',
  'Solar',
  'Velvet',
  'Wild',
  'Copper',
  'Midnight',
]
const nouns: Array<[string, ArtKey]> = [
  ['Ape', 'emerald'],
  ['Nomad', 'nomad'],
  ['Baron', 'baron'],
  ['Beat', 'golden'],
  ['Signal', 'golden'],
  ['Drifter', 'nomad'],
  ['Monk', 'baron'],
  ['Pilot', 'emerald'],
  ['Rebel', 'baron'],
  ['Echo', 'golden'],
  ['Totem', 'emerald'],
  ['Sage', 'nomad'],
]
const categoryCycle: CategoryId[] = [
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativo',
  'jogos',
  'arquitetura',
  'utilidade',
]
const networkCycle: NetworkId[] = [
  'ethereum',
  'ethereum',
  'polygon',
  'ethereum',
  'solana',
  'polygon',
]

function price(base: number, factor: number) {
  return new Big(base).times(factor).round(2, Big.roundHalfUp).toFixed(2)
}

function generatedSeeds(count: number): Seed[] {
  const random = createRandom(20260729)
  const used = new Set(figmaSeeds.map((seed) => seed.name))
  const seeds: Seed[] = []
  let index = 0
  while (seeds.length < count) {
    const adjective = adjectives[index % adjectives.length] as string
    const [noun, art] = nouns[
      (index * 5 + Math.floor(index / adjectives.length)) % nouns.length
    ] as [string, ArtKey]
    index += 1
    const number = random.int(1, 999)
    const name = `${adjective} ${noun} #${String(number).padStart(3, '0')}`
    if (used.has(name)) continue
    used.add(name)
    const base = Number((random.int(5, 420) / 100).toFixed(2))
    const kinds: EditionKind[] = (['1/1', '1/10', '1/50', 'open'] as const).filter((kind) =>
      kind === '1/50' ? true : random.chance(0.45),
    )
    const soldOut = random.chance(0.08)
    const editions: Seed['editions'] = kinds.map((kind) => {
      const factor = kind === '1/1' ? 5 : kind === '1/10' ? 2.1 : kind === 'open' ? 0.8 : 1
      const maxAvailable = kind === '1/1' ? 1 : kind === '1/10' ? 10 : kind === '1/50' ? 50 : 999
      const available = soldOut
        ? 0
        : kind === 'open'
          ? 999
          : random.int(kind === '1/1' ? 0 : 0, maxAvailable)
      return [kind, price(base, factor), available]
    })
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    seeds.push({
      id: slug,
      name,
      tokenId: `#${String(number).padStart(4, '0')}`,
      art,
      collection: random.pick(collections),
      category: categoryCycle[seeds.length % categoryCycle.length] as CategoryId,
      network: networkCycle[seeds.length % networkCycle.length] as NetworkId,
      editions,
      daysAgo: random.int(1, 160),
      popularity: random.int(20, 900),
      attributes: [random.pick(attributePool), random.pick(attributePool)].filter(
        (value, i, all) => all.indexOf(value) === i,
      ),
      creator: random.pick(creators),
      rating: { average: Number((3.5 + random.next() * 1.5).toFixed(1)), count: random.int(0, 40) },
    })
  }
  return seeds
}

function contractAddress(seed: Seed, position: number) {
  const hex = (position * 2654435761 + seed.tokenId.length * 97).toString(16).padStart(8, '0')
  return `0x7a42${hex}${'0'.repeat(24)}19e8`.slice(0, 42)
}

function toDetail(seed: Seed, position: number): NftDetail {
  const editions = seed.editions.map(([kind, priceEth, available]) =>
    edition(seed.id, kind, priceEth, available),
  )
  const { priceEth, available } = cheapestAvailable(editions)
  return {
    id: seed.id,
    tokenId: seed.tokenId,
    name: seed.name,
    collection: { ...seed.collection },
    category: seed.category,
    network: seed.network,
    image: image(seed.art, seed.name),
    priceEth,
    available,
    featured: seed.featured ?? false,
    createdAt: new Date(fixtureNow - seed.daysAgo * 86_400_000).toISOString(),
    popularity: seed.popularity,
    version: 1,
    description: `Um colecionável digital finalizado à mão da coleção ${seed.collection.name}, verificado na ${seed.network === 'solana' ? 'Solana' : seed.network === 'polygon' ? 'Polygon' : 'Ethereum'}, com arte desbloqueável e acesso para colecionadores.`,
    story: [
      `${seed.name} é uma obra digital finalizada à mão da coleção ${seed.collection.name}. Cada atributo fica armazenado nos metadados do token e verificado na rede. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
      `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrado na rede. ${seed.creator} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
    ],
    creator: { name: seed.creator, royaltyPercent: 5 },
    gallery: [
      image(seed.art, seed.name),
      image(seed.art, `${seed.name}, detalhe`),
      image(seed.art, `${seed.name}, verso`),
      image(seed.art, `${seed.name}, moldura`),
    ],
    editions,
    attributes: seed.attributes,
    rating: seed.rating,
    contract: { address: contractAddress(seed, position), standard: 'ERC-721' },
    storage: 'IPFS',
  }
}

export function buildNftFixtures(): NftDetail[] {
  return [...figmaSeeds, ...generatedSeeds(63)].map(toDetail)
}

export function recalculateSummary(nft: NftDetail): NftDetail {
  const { priceEth, available } = cheapestAvailable(nft.editions)
  return { ...nft, priceEth, available }
}
