import { http, HttpResponse } from 'msw'
import { nftListParams } from '@/api/contracts'
import { apiPath } from '../config'
import { featuredNfts, findNft, listNfts, relatedNfts } from '../domain/catalog'
import { apiError, withNetwork } from '../network'
import { getScenario } from '../scenarios'

function parseListParams(url: URL) {
  const toNumber = (value: string | null) => (value === null ? undefined : Number(value))
  const list = (key: string) => {
    const values = url.searchParams.getAll(key).filter(Boolean)
    return values.length ? values : undefined
  }
  return nftListParams.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    categories: list('categories'),
    networks: list('networks'),
    minPrice: url.searchParams.get('minPrice') ?? undefined,
    maxPrice: url.searchParams.get('maxPrice') ?? undefined,
    tab: url.searchParams.get('tab') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    page: toNumber(url.searchParams.get('page')),
    pageSize: toNumber(url.searchParams.get('pageSize')),
  })
}

export const catalogHandlers = [
  http.get(
    apiPath('/nfts'),
    withNetwork('nfts:list', ({ request }) => {
      const parsed = parseListParams(new URL(request.url))
      if (!parsed.success) {
        return apiError(400, 'VALIDATION_ERROR', 'Parâmetros de busca inválidos.', {
          details: { issues: parsed.error.issues.map((issue) => issue.path.join('.')) },
        })
      }
      return HttpResponse.json(listNfts(parsed.data, Boolean(getScenario().emptyCatalog)))
    }),
  ),
  http.get(
    apiPath('/nfts/featured'),
    withNetwork('nfts:featured', () =>
      HttpResponse.json({ items: getScenario().emptyCatalog ? [] : featuredNfts() }),
    ),
  ),
  http.get(
    apiPath('/nfts/:nftId/related'),
    withNetwork('nfts:detail', ({ params }) =>
      HttpResponse.json({ items: relatedNfts(String(params.nftId)) }),
    ),
  ),
  http.get(
    apiPath('/nfts/:nftId'),
    withNetwork('nfts:detail', ({ params }) => {
      const nft = findNft(String(params.nftId))
      if (!nft) return apiError(404, 'NOT_FOUND', 'NFT não encontrado.')
      return HttpResponse.json(nft)
    }),
  ),
]
