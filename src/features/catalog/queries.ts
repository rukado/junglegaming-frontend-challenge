import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { NftListParams } from '@/api/contracts'
import { nftsApi } from '@/api/endpoints/nfts'
import { queryKeys } from '@/app/query-keys'

export function catalogQueryOptions(params: NftListParams) {
  return queryOptions({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => nftsApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function featuredQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.nfts.featured(),
    queryFn: ({ signal }) => nftsApi.featured(signal),
    staleTime: 5 * 60_000,
  })
}
