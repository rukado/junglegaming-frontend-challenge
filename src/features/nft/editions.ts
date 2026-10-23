import type { NftDetail } from '@/api/contracts'
import { compareEth } from '@/lib/money'

export function pickDefaultEdition(nft: NftDetail, requested: string | undefined) {
  const requestedEdition = nft.editions.find((edition) => edition.id === requested)
  if (requestedEdition) return requestedEdition
  const available = nft.editions.filter((edition) => edition.available > 0)
  const pool = available.length ? available : nft.editions
  return pool.reduce((cheapest, edition) =>
    compareEth(edition.priceEth, cheapest.priceEth) < 0 ? edition : cheapest,
  )
}
