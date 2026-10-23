import { http, HttpResponse } from 'msw'
import { apiPath } from '../config'
import { getDb, mutate } from '../db/store'
import { authenticate } from '../domain/auth'
import { findNft, toSummary } from '../domain/catalog'
import { apiError, withNetwork } from '../network'

function favoritesFor(userId: string) {
  const nftIds = getDb().favorites[userId] ?? []
  const items = nftIds.flatMap((id) => {
    const nft = findNft(id)
    return nft ? [toSummary(nft)] : []
  })
  return { nftIds, items }
}

export const favoritesHandlers = [
  http.get(
    apiPath('/favorites'),
    withNetwork('favorites:read', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      return HttpResponse.json(favoritesFor(auth.user.id))
    }),
  ),
  http.put(
    apiPath('/favorites/:nftId'),
    withNetwork('favorites:write', ({ request, params }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const nftId = String(params.nftId)
      if (!findNft(nftId)) return apiError(404, 'NOT_FOUND', 'NFT não encontrado.')
      mutate((db) => {
        const current = db.favorites[auth.user.id] ?? []
        if (!current.includes(nftId)) db.favorites[auth.user.id] = [...current, nftId]
      })
      return HttpResponse.json(favoritesFor(auth.user.id))
    }),
  ),
  http.delete(
    apiPath('/favorites/:nftId'),
    withNetwork('favorites:write', ({ request, params }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const nftId = String(params.nftId)
      mutate((db) => {
        db.favorites[auth.user.id] = (db.favorites[auth.user.id] ?? []).filter((id) => id !== nftId)
      })
      return HttpResponse.json(favoritesFor(auth.user.id))
    }),
  ),
]
