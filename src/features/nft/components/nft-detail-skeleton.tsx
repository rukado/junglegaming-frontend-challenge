export function NftDetailSkeleton() {
  return (
    <div className="container-page pt-6" aria-busy="true" aria-label="Carregando NFT">
      <div className="skeleton-shimmer mb-3 hidden h-4 w-36 rounded-sm md:block" />
      <div className="flex flex-col gap-8 md:flex-row md:gap-8">
        <div className="flex gap-7">
          <div className="hidden w-[100px] flex-col gap-4 md:flex">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="skeleton-shimmer size-[100px] rounded-[10px]" />
            ))}
          </div>
          <div className="flex aspect-square w-full items-center justify-center bg-surface-card p-5 md:size-[444px]">
            <div className="skeleton-shimmer aspect-square w-full rounded-[18px]" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <div className="skeleton-shimmer h-9 w-2/3 rounded-sm" />
          <div className="skeleton-shimmer h-5 w-1/4 rounded-sm" />
          <div className="skeleton-shimmer h-20 w-full rounded-sm" />
          <div className="skeleton-shimmer h-7 w-1/2 rounded-full" />
          <div className="skeleton-shimmer h-10 w-full rounded-md" />
          <div className="skeleton-shimmer h-16 w-2/3 rounded-sm" />
        </div>
      </div>
    </div>
  )
}
