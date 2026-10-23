import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { NftSummary } from '@/api/contracts'
import { formatEthAmount } from '@/lib/format'
import { cn } from '@/lib/utils'

type NftCardProps = {
  nft: NftSummary
  previousPriceEth?: string | null
  action?: ReactNode
  priority?: boolean
  className?: string
}

function availabilityBadge(nft: NftSummary) {
  if (nft.available === 0) return 'ESGOTADO'
  if (nft.available <= 3) return 'RARO'
  return null
}

export function NftCard({
  nft,
  previousPriceEth,
  action,
  priority = false,
  className,
}: NftCardProps) {
  const badge = availabilityBadge(nft)
  return (
    <article className={cn('group relative flex flex-col gap-2 md:gap-3', className)}>
      <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(139.5deg,#241612_12%,#2f1d15_106.6%)] px-1 md:h-[300px] md:rounded-none md:bg-surface-card">
        <img
          src={nft.image.md}
          srcSet={`${nft.image.sm} 160w, ${nft.image.md} 320w, ${nft.image.lg} 640w`}
          sizes="(min-width: 768px) 250px, 168px"
          width={250}
          height={250}
          alt={nft.image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="aspect-square w-full max-w-[168px] rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02] md:max-w-[250px] md:rounded-[15px]"
        />
        {badge && (
          <span className="absolute top-4 left-0 bg-primary px-2 py-2 text-[13px] leading-4 font-medium text-ink">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 pl-2 md:gap-1.5 md:pl-0">
        <h3 className="text-[15px] leading-tight text-foreground md:text-body-lg md:leading-4">
          <Link
            to="/nft/$nftId"
            params={{ nftId: nft.id }}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-[20px] focus-visible:after:outline-2 focus-visible:after:outline-ring md:focus-visible:after:rounded-none"
          >
            {nft.name}
          </Link>
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-3 text-body-lg leading-4 md:text-lead md:leading-4">
          <span className="font-bold text-text-accent">{formatEthAmount(nft.priceEth)}</span>
          {previousPriceEth && previousPriceEth !== nft.priceEth && (
            <span className="text-sand line-through">
              <span className="sr-only">Preço anterior: </span>
              {formatEthAmount(previousPriceEth)}
            </span>
          )}
        </p>
      </div>
      {action && <div className="absolute top-3 right-3 z-10 md:top-4 md:right-4">{action}</div>}
    </article>
  )
}

export function NftCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 md:gap-3" aria-hidden="true">
      <div className="flex h-[200px] items-center justify-center rounded-[20px] bg-surface-card px-1 md:h-[300px] md:rounded-none">
        <div className="skeleton-shimmer aspect-square w-full max-w-[168px] rounded-2xl md:max-w-[250px] md:rounded-[15px]" />
      </div>
      <div className="flex flex-col gap-1.5 pl-2 md:pl-0">
        <div className="skeleton-shimmer h-4 w-3/4 rounded-sm" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded-sm" />
      </div>
    </div>
  )
}
