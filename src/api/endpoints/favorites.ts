import { favoritesResponse } from '../contracts'
import { request } from '../http'

export const favoritesApi = {
  list: (signal?: AbortSignal) =>
    request(favoritesResponse, { method: 'GET', url: '/favorites', signal }),
  add: (nftId: string) =>
    request(favoritesResponse, { method: 'PUT', url: `/favorites/${encodeURIComponent(nftId)}` }),
  remove: (nftId: string) =>
    request(favoritesResponse, {
      method: 'DELETE',
      url: `/favorites/${encodeURIComponent(nftId)}`,
    }),
}
