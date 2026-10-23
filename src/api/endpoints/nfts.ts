import {
  featuredResponse,
  nftDetail,
  nftListResponse,
  relatedResponse,
  type NftListParams,
} from '../contracts'
import { request } from '../http'

export const nftsApi = {
  list: (params: NftListParams, signal?: AbortSignal) =>
    request(nftListResponse, { method: 'GET', url: '/nfts', params, signal }),
  featured: (signal?: AbortSignal) =>
    request(featuredResponse, { method: 'GET', url: '/nfts/featured', signal }),
  detail: (nftId: string, signal?: AbortSignal) =>
    request(nftDetail, { method: 'GET', url: `/nfts/${encodeURIComponent(nftId)}`, signal }),
  related: (nftId: string, signal?: AbortSignal) =>
    request(relatedResponse, {
      method: 'GET',
      url: `/nfts/${encodeURIComponent(nftId)}/related`,
      signal,
    }),
}
