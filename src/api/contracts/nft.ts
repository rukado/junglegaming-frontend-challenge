import { z } from 'zod'
import { ethAmount, evmAddress, isoDate, networkId, paginated } from './common'

export const categoryIds = [
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'colecionaveis',
  'generativo',
  'jogos',
  'arquitetura',
  'utilidade',
] as const
export const categoryId = z.enum(categoryIds)
export type CategoryId = z.infer<typeof categoryId>

export const categoryLabels: Record<CategoryId, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  generativo: 'Generativo',
  jogos: 'Jogos',
  arquitetura: 'Arquitetura',
  utilidade: 'Utilidade',
}

export const editionKinds = ['1/1', '1/10', '1/50', 'open'] as const
export const editionKind = z.enum(editionKinds)
export type EditionKind = z.infer<typeof editionKind>

export const editionLabels: Record<EditionKind, string> = {
  '1/1': '1/1',
  '1/10': '1/10',
  '1/50': '1/50',
  open: 'ABERTA',
}

export const edition = z.object({
  id: z.string(),
  kind: editionKind,
  priceEth: ethAmount,
  supply: z.number().int().positive().nullable(),
  available: z.number().int().min(0),
  maxPerOrder: z.number().int().positive(),
})
export type Edition = z.infer<typeof edition>

export const nftImage = z.object({
  src: z.string(),
  alt: z.string(),
})
export type NftImage = z.infer<typeof nftImage>

export const nftSummary = z.object({
  id: z.string(),
  tokenId: z.string(),
  name: z.string(),
  collection: z.object({ id: z.string(), name: z.string() }),
  category: categoryId,
  network: networkId,
  image: nftImage,
  priceEth: ethAmount,
  available: z.number().int().min(0),
  featured: z.boolean(),
  createdAt: isoDate,
  popularity: z.number().int().min(0),
  version: z.number().int().min(1),
})
export type NftSummary = z.infer<typeof nftSummary>

export const nftDetail = nftSummary.extend({
  description: z.string(),
  story: z.array(z.string()),
  creator: z.object({ name: z.string(), royaltyPercent: z.number().min(0).max(100) }),
  gallery: z.array(nftImage).min(1),
  editions: z.array(edition).min(1),
  attributes: z.array(z.string()),
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().min(0) }),
  contract: z.object({ address: evmAddress, standard: z.string() }),
  storage: z.string(),
})
export type NftDetail = z.infer<typeof nftDetail>

export const sortOptions = ['recent', 'price-asc', 'price-desc', 'popular'] as const
export const sortOption = z.enum(sortOptions)
export type SortOption = z.infer<typeof sortOption>

export const sortLabels: Record<SortOption, string> = {
  recent: 'Listados recentemente',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  popular: 'Mais populares',
}

export const catalogTabs = ['all', 'new', 'trending'] as const
export const catalogTab = z.enum(catalogTabs)
export type CatalogTab = z.infer<typeof catalogTab>

export const catalogTabLabels: Record<CatalogTab, string> = {
  all: 'Todos os NFTs',
  new: 'Novos lançamentos',
  trending: 'Em alta',
}

export const nftListParams = z.object({
  q: z.string().optional(),
  categories: z.array(categoryId).optional(),
  networks: z.array(networkId).optional(),
  minPrice: ethAmount.optional(),
  maxPrice: ethAmount.optional(),
  tab: catalogTab.optional(),
  sort: sortOption.optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
})
export type NftListParams = z.infer<typeof nftListParams>

export const facetCount = z.object({ id: z.string(), count: z.number().int().min(0) })

export const nftListResponse = paginated(nftSummary).extend({
  facets: z.object({
    categories: z.array(facetCount.extend({ id: categoryId })),
    networks: z.array(facetCount.extend({ id: networkId })),
    priceRange: z.object({ min: ethAmount, max: ethAmount }),
  }),
})
export type NftListResponse = z.infer<typeof nftListResponse>

export const featuredResponse = z.object({ items: z.array(nftSummary) })
export type FeaturedResponse = z.infer<typeof featuredResponse>

export const relatedResponse = z.object({ items: z.array(nftSummary) })
