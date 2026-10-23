import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { featuredQueryOptions } from '../queries'

export function FeaturedBanner() {
  const { data } = useQuery(featuredQueryOptions())
  const nft = data?.items[1] ?? data?.items[0]

  return (
    <aside
      aria-labelledby="featured-banner-title"
      className="relative hidden h-[470px] w-[310px] overflow-hidden bg-[linear-gradient(to_bottom,rgba(210,138,76,0.1),rgba(210,138,76,0.03))] pt-6 pb-1 lg:block"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 px-5">
          <h2
            id="featured-banner-title"
            className="w-full text-heading leading-8 font-bold text-text-accent"
          >
            NFT EM DESTAQUE
          </h2>
          <p className="w-full text-center text-[22px] leading-4 font-bold text-foreground">
            OFERTA LIMITADA
          </p>
        </div>
        {nft ? (
          <Link to="/nft/$nftId" params={{ nftId: nft.id }} className="block rounded-[22px]">
            <img
              src={nft.image.lg}
              width={310}
              height={368}
              alt={nft.image.alt}
              loading="lazy"
              className="h-[368px] w-full rounded-[22px] object-cover"
            />
            <span className="sr-only">Ver {nft.name}</span>
          </Link>
        ) : (
          <div className="skeleton-shimmer h-[368px] w-full rounded-[22px]" aria-hidden="true" />
        )}
      </div>
      <span
        aria-hidden="true"
        className="absolute top-[299px] left-4 size-[22px] rounded-[7px] border-2 border-[#46a358] opacity-20"
      />
      <span
        aria-hidden="true"
        className="absolute top-[343px] left-[248px] size-[45px] rounded-[29px] bg-[linear-gradient(145deg,rgba(210,138,76,0.3)_46%,rgba(210,138,76,0)_103%)]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[105px] left-[38px] size-[15px] rounded-[29px] bg-[linear-gradient(145deg,rgba(210,138,76,0.3)_46%,rgba(210,138,76,0)_103%)]"
      />
    </aside>
  )
}
