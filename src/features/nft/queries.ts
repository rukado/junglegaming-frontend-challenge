import { queryOptions } from '@tanstack/react-query'
import { nftsApi } from '@/api/endpoints/nfts'
import { queryKeys } from '@/app/query-keys'

export function nftDetailQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => nftsApi.detail(nftId, signal),
  })
}

export function relatedNftsQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.related(nftId),
    queryFn: ({ signal }) => nftsApi.related(nftId, signal),
    staleTime: 5 * 60_000,
  })
}
