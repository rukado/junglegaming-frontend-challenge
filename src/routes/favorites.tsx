import { createFileRoute, Link } from '@tanstack/react-router'
import { errorMessage } from '@/api/errors'
import { StatusMessage } from '@/components/common/status-message'
import { AccountLayout } from '@/features/account/components/account-layout'
import { requireSession } from '@/features/auth/guards'
import { NftCard, NftCardSkeleton } from '@/features/catalog/components/nft-card'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useFavorites } from '@/features/favorites/queries'

export const Route = createFileRoute('/favorites')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Lista de interesse · Kurio' }] }),
  component: FavoritesPage,
})

function FavoritesPage() {
  const { query } = useFavorites()
  const items = query.data?.items ?? []

  let content
  if (query.isError && !query.data) {
    content = (
      <StatusMessage
        tone="error"
        title="Não foi possível carregar seus favoritos"
        description={errorMessage(query.error)}
        action={
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
          >
            Tentar novamente
          </button>
        }
      />
    )
  } else if (!query.data) {
    content = (
      <ul aria-busy="true" className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 3 }, (_, index) => (
          <li key={index}>
            <NftCardSkeleton />
          </li>
        ))}
      </ul>
    )
  } else if (items.length === 0) {
    content = (
      <StatusMessage
        tone="empty"
        title="Nenhum NFT na sua lista"
        description="Toque no coração de um NFT para acompanhá-lo aqui."
        action={
          <Link
            to="/"
            hash="catalogo"
            className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
          >
            Explorar NFTs
          </Link>
        }
      />
    )
  } else {
    content = (
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {items.map((nft) => (
          <li key={nft.id}>
            <NftCard nft={nft} action={<FavoriteButton nftId={nft.id} name={nft.name} />} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <AccountLayout>
      <h1 className="mb-6 text-body-lg leading-4 font-bold text-foreground">Lista de interesse</h1>
      {content}
    </AccountLayout>
  )
}
