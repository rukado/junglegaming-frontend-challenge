import type { NftListResponse } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'
import { StatusMessage } from '@/components/common/status-message'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { cn } from '@/lib/utils'
import { catalogPageSize } from '../search'
import { NftCard, NftCardSkeleton } from './nft-card'

type CatalogResultsProps = {
  data: NftListResponse | undefined
  isPending: boolean
  isError: boolean
  isFetching: boolean
  isPlaceholderData: boolean
  errorMessage: string | null
  onRetry: () => void
  onClearFilters: (() => void) | null
}

const gridClass =
  'grid grid-cols-2 gap-x-4 gap-y-6 pb-8 md:grid-cols-3 md:gap-x-6 md:gap-y-[72px] md:pb-0 [&>*:nth-child(even)]:translate-y-8 md:[&>*:nth-child(even)]:translate-y-0'

export function CatalogResults({
  data,
  isPending,
  isError,
  isFetching,
  isPlaceholderData,
  errorMessage,
  onRetry,
  onClearFilters,
}: CatalogResultsProps) {
  if (isPending) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Carregando NFTs">
        {Array.from({ length: catalogPageSize }, (_, index) => (
          <NftCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError && !data) {
    return (
      <StatusMessage
        tone="error"
        title="Não foi possível carregar o catálogo"
        description={errorMessage ?? 'Tente novamente em instantes.'}
        action={<ActionButton onClick={onRetry}>Tentar novamente</ActionButton>}
      />
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <StatusMessage
        tone="empty"
        title="Nenhum NFT encontrado"
        description="Ajuste a busca ou os filtros para ver mais resultados."
        action={
          onClearFilters && (
            <ActionButton variant="outline" onClick={onClearFilters}>
              Limpar filtros
            </ActionButton>
          )
        }
      />
    )
  }

  const updating = isFetching && isPlaceholderData
  return (
    <div className="flex flex-col gap-4">
      {isError && (
        <StatusMessage
          tone="error"
          title="Não foi possível atualizar os resultados"
          description={errorMessage ?? 'Exibindo os últimos resultados carregados.'}
          action={<ActionButton onClick={onRetry}>Tentar novamente</ActionButton>}
          className="py-6"
        />
      )}
      <ul
        className={cn(gridClass, 'transition-opacity', updating && 'opacity-60')}
        aria-busy={updating || undefined}
      >
        {data.items.map((nft, index) => (
          <li key={nft.id}>
            <NftCard
              nft={nft}
              priority={index < 3}
              action={<FavoriteButton nftId={nft.id} name={nft.name} />}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
