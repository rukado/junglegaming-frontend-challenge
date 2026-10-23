import { useQuery } from '@tanstack/react-query'
import { createFileRoute, isRedirect, notFound, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { hasErrorCode } from '@/api/errors'
import { NftDetailSkeleton } from '@/features/nft/components/nft-detail-skeleton'
import { pickDefaultEdition } from '@/features/nft/editions'
import { NftDetailView } from '@/features/nft/components/nft-detail-view'
import { NftDetailsTabs } from '@/features/nft/components/nft-details-tabs'
import { NftNotFound } from '@/features/nft/components/nft-not-found'
import { RelatedNfts } from '@/features/nft/components/related-nfts'
import { nftDetailQueryOptions, relatedNftsQueryOptions } from '@/features/nft/queries'

export const Route = createFileRoute('/nft/$nftId')({
  validateSearch: z.object({ edition: z.string().optional().catch(undefined) }),
  staticData: { mobileChrome: 'minimal' },
  loaderDeps: ({ search }) => ({ edition: search.edition }),
  loader: async ({ context, params, deps }) => {
    void context.queryClient.prefetchQuery(relatedNftsQueryOptions(params.nftId))
    try {
      const nft = await context.queryClient.ensureQueryData(nftDetailQueryOptions(params.nftId))
      if (!deps.edition || !nft.editions.some((edition) => edition.id === deps.edition)) {
        throw redirect({
          to: '/nft/$nftId',
          params,
          search: { edition: pickDefaultEdition(nft, undefined).id },
          replace: true,
        })
      }
      return { name: nft.name, description: nft.description }
    } catch (error) {
      if (isRedirect(error)) throw error
      if (hasErrorCode(error, 'NOT_FOUND')) throw notFound()
      throw error
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} · Kurio` },
          { name: 'description', content: loaderData.description },
        ]
      : [{ title: 'NFT não encontrado · Kurio' }],
  }),
  pendingComponent: NftDetailSkeleton,
  pendingMs: 200,
  notFoundComponent: NftNotFound,
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const { edition } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: nft } = useQuery(nftDetailQueryOptions(nftId))
  if (!nft) return <NftDetailSkeleton />

  return (
    <>
      <NftDetailView
        nft={nft}
        editionId={edition}
        onEditionChange={(editionId) =>
          void navigate({ search: { edition: editionId }, replace: true, resetScroll: false })
        }
      />
      <NftDetailsTabs nft={nft} />
      <RelatedNfts nftId={nft.id} title="Mais desta coleção" />
    </>
  )
}
