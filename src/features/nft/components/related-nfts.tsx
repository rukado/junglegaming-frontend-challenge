import { useQuery } from '@tanstack/react-query'
import { NftCard, NftCardSkeleton } from '@/features/catalog/components/nft-card'
import { relatedNftsQueryOptions } from '../queries'

export function RelatedNfts({ nftId, title }: { nftId: string; title: string }) {
  const { data, isPending, isError } = useQuery(relatedNftsQueryOptions(nftId))
  if (isError || (data && data.items.length === 0)) return null
  return (
    <section aria-labelledby="related-title" className="container-page mt-16 md:mt-24">
      <h2
        id="related-title"
        className="border-b border-primary/60 pb-2 text-body-lg font-bold text-text-accent"
      >
        {title}
      </h2>
      <ul className="mt-6 flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible lg:grid-cols-5">
        {isPending
          ? Array.from({ length: 5 }, (_, index) => (
              <li key={index} className="w-[200px] shrink-0 md:w-auto">
                <NftCardSkeleton />
              </li>
            ))
          : data.items.map((nft) => (
              <li key={nft.id} className="w-[200px] shrink-0 snap-start md:w-auto">
                <NftCard nft={nft} className="[&_h3]:text-body [&_p]:text-body-lg" />
              </li>
            ))}
      </ul>
    </section>
  )
}
