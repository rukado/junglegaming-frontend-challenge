import { Link } from '@tanstack/react-router'
import { StatusMessage } from '@/components/common/status-message'

export function NftNotFound() {
  return (
    <div className="container-page py-12">
      <StatusMessage
        tone="empty"
        title="NFT não encontrado"
        description="O NFT que você procura não existe ou foi removido do catálogo."
        action={
          <Link
            to="/"
            hash="catalogo"
            className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-body font-bold text-ink hover:bg-text-accent"
          >
            Explorar o catálogo
          </Link>
        }
      />
    </div>
  )
}
