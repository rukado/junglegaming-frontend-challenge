import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  return <PageShell title="Detalhes do NFT" description={nftId} />
}
