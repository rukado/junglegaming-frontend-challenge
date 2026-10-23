import { Big } from 'big.js'
import type { NftDetail, NftListParams, NftListResponse, NftSummary } from '@/api/contracts'
import { categoryIds, networkIds } from '@/api/contracts'
import { fixtureNow } from '../config'
import { getDb, mutate } from '../db/store'
import { recalculateSummary } from '../db/fixtures/nfts'

export function toSummary(nft: NftDetail): NftSummary {
  return {
    id: nft.id,
    tokenId: nft.tokenId,
    name: nft.name,
    collection: nft.collection,
    category: nft.category,
    network: nft.network,
    image: nft.image,
    priceEth: nft.priceEth,
    available: nft.available,
    featured: nft.featured,
    createdAt: nft.createdAt,
    popularity: nft.popularity,
    version: nft.version,
  }
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function matchesQuery(nft: NftDetail, q: string | undefined) {
  if (!q) return true
  const needle = normalize(q)
  return [nft.name, nft.collection.name, nft.tokenId, nft.creator.name].some((field) =>
    normalize(field).includes(needle),
  )
}

const newWindowMs = 30 * 86_400_000
const trendingThreshold = 600

export function listNfts(params: NftListParams, emptyCatalog: boolean): NftListResponse {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 9
  const all = emptyCatalog ? [] : getDb().nfts
  const byQuery = all.filter((nft) => matchesQuery(nft, params.q))
  const byTab = byQuery.filter((nft) => {
    if (params.tab === 'new') return fixtureNow - Date.parse(nft.createdAt) <= newWindowMs
    if (params.tab === 'trending') return nft.popularity >= trendingThreshold
    return true
  })
  const filtered = byTab.filter((nft) => {
    if (params.categories?.length && !params.categories.includes(nft.category)) return false
    if (params.networks?.length && !params.networks.includes(nft.network)) return false
    if (params.minPrice && new Big(nft.priceEth).lt(params.minPrice)) return false
    if (params.maxPrice && new Big(nft.priceEth).gt(params.maxPrice)) return false
    return true
  })
  const sorted = [...filtered].sort((a, b) => {
    switch (params.sort ?? 'recent') {
      case 'price-asc':
        return new Big(a.priceEth).cmp(b.priceEth) || a.id.localeCompare(b.id)
      case 'price-desc':
        return new Big(b.priceEth).cmp(a.priceEth) || a.id.localeCompare(b.id)
      case 'popular':
        return b.popularity - a.popularity || a.id.localeCompare(b.id)
      case 'recent':
        return Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id)
    }
  })
  const total = sorted.length
  const totalPages = Math.ceil(total / pageSize)
  const items = sorted.slice((page - 1) * pageSize, page * pageSize).map(toSummary)
  const prices = all.map((nft) => new Big(nft.priceEth))
  const min = prices.length ? prices.reduce((a, b) => (a.lt(b) ? a : b)) : new Big(0)
  const max = prices.length ? prices.reduce((a, b) => (a.gt(b) ? a : b)) : new Big(0)
  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    facets: {
      categories: categoryIds.map((id) => ({
        id,
        count: byTab.filter((nft) => nft.category === id).length,
      })),
      networks: networkIds.map((id) => ({
        id,
        count: byTab.filter((nft) => nft.network === id).length,
      })),
      priceRange: { min: min.toFixed(2), max: max.toFixed(2) },
    },
  }
}

export function findNft(nftId: string): NftDetail | undefined {
  return getDb().nfts.find((nft) => nft.id === nftId)
}

export function featuredNfts(): NftSummary[] {
  return getDb()
    .nfts.filter((nft) => nft.featured)
    .map(toSummary)
}

export function relatedNfts(nftId: string): NftSummary[] {
  const nft = findNft(nftId)
  if (!nft) return []
  const pool = getDb().nfts.filter((candidate) => candidate.id !== nftId)
  const sameCollection = pool.filter((candidate) => candidate.collection.id === nft.collection.id)
  const sameCategory = pool.filter(
    (candidate) =>
      candidate.category === nft.category && candidate.collection.id !== nft.collection.id,
  )
  return [...sameCollection, ...sameCategory].slice(0, 5).map(toSummary)
}

export function updateEdition(
  nftId: string,
  editionId: string,
  patch: { priceEth?: string; available?: number },
): NftDetail | null {
  return mutate((db) => {
    const index = db.nfts.findIndex((nft) => nft.id === nftId)
    const current = db.nfts[index]
    if (!current) return null
    const editions = current.editions.map((edition) =>
      edition.id === editionId
        ? {
            ...edition,
            priceEth: patch.priceEth ?? edition.priceEth,
            available: Math.max(0, patch.available ?? edition.available),
          }
        : edition,
    )
    const next = recalculateSummary({ ...current, editions, version: current.version + 1 })
    db.nfts[index] = next
    return next
  })
}

export function adjustAvailability(
  changes: Array<{ nftId: string; editionId: string; delta: number }>,
): NftDetail[] {
  const touched = new Map<string, NftDetail>()
  changes.forEach(({ nftId, editionId, delta }) => {
    const nft = touched.get(nftId) ?? findNft(nftId)
    const edition = nft?.editions.find((candidate) => candidate.id === editionId)
    if (!nft || !edition) return
    const updated = updateEdition(nftId, editionId, { available: edition.available + delta })
    if (updated) touched.set(nftId, updated)
  })
  return Array.from(touched.values())
}
