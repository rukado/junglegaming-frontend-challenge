import { z } from 'zod'
import {
  catalogTab,
  categoryId,
  ethAmount,
  networkId,
  sortOption,
  type NftListParams,
} from '@/api/contracts'

export const catalogPageSize = 9

export const catalogSearchDefaults = {
  q: '',
  categories: [] as z.infer<typeof categoryId>[],
  networks: [] as z.infer<typeof networkId>[],
  minPrice: '',
  maxPrice: '',
  tab: 'all' as const,
  sort: 'recent' as const,
  page: 1,
}

export const catalogSearchSchema = z.object({
  q: z.string().trim().max(80).default('').catch(''),
  categories: z.array(categoryId).default([]).catch([]),
  networks: z.array(networkId).default([]).catch([]),
  minPrice: z
    .union([ethAmount, z.literal('')])
    .default('')
    .catch(''),
  maxPrice: z
    .union([ethAmount, z.literal('')])
    .default('')
    .catch(''),
  tab: catalogTab.default('all').catch('all'),
  sort: sortOption.default('recent').catch('recent'),
  page: z.number().int().min(1).max(500).default(1).catch(1),
})

export type CatalogSearch = z.infer<typeof catalogSearchSchema>

export function toListParams(search: CatalogSearch): NftListParams {
  return {
    q: search.q || undefined,
    categories: search.categories.length ? [...search.categories].sort() : undefined,
    networks: search.networks.length ? [...search.networks].sort() : undefined,
    minPrice: search.minPrice || undefined,
    maxPrice: search.maxPrice || undefined,
    tab: search.tab,
    sort: search.sort,
    page: search.page,
    pageSize: catalogPageSize,
  }
}

export function hasActiveFilters(search: CatalogSearch) {
  return Boolean(
    search.q ||
    search.categories.length ||
    search.networks.length ||
    search.minPrice ||
    search.maxPrice ||
    search.tab !== 'all',
  )
}
