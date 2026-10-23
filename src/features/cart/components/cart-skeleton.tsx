export function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando carrinho" className="flex flex-col gap-5 md:gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex h-[100px] gap-4 rounded-[14px] bg-surface-card md:h-[70px] md:rounded-none"
        >
          <div className="skeleton-shimmer size-[100px] shrink-0 rounded-[14px] md:size-[70px] md:rounded-md" />
          <div className="flex flex-1 flex-col justify-center gap-2 pr-4">
            <div className="skeleton-shimmer h-4 w-2/5 rounded-sm" />
            <div className="skeleton-shimmer h-3 w-1/4 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}
