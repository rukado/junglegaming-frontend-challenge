import { createFileRoute, Link } from '@tanstack/react-router'
import { errorMessage } from '@/api/errors'
import { StatusMessage } from '@/components/common/status-message'
import { MobileScreenHeader } from '@/components/layout/mobile-screen-header'
import { requireSession } from '@/features/auth/guards'
import { useSession } from '@/features/auth/session'
import { useCart } from '@/features/cart/queries'
import { CheckoutView } from '@/features/checkout/components/checkout-view'
import { useWallets } from '@/features/wallets/queries'

export const Route = createFileRoute('/checkout')({
  beforeLoad: requireSession,
  staticData: { mobileChrome: 'minimal' },
  head: () => ({ meta: [{ title: 'Pagamento · Kurio' }] }),
  component: CheckoutPage,
})

function CheckoutSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando pagamento"
      className="container-page pt-8 pb-10 md:pt-6"
    >
      <MobileScreenHeader title="Pagamento com carteira" className="mb-6" />
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[763fr_405fr] lg:gap-x-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="skeleton-shimmer h-3 w-1/3 rounded-sm" />
              <div className="skeleton-shimmer h-10 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton-shimmer h-[70px] rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}

function CheckoutPage() {
  const session = useSession()
  const { viewer, query: cartQuery } = useCart()
  const wallets = useWallets()

  const failed = cartQuery.isError ? cartQuery.error : wallets.isError ? wallets.error : null
  if (failed) {
    return (
      <div className="container-page py-10">
        <StatusMessage
          tone="error"
          title="Não foi possível carregar o pagamento"
          description={errorMessage(failed)}
          action={
            <button
              type="button"
              onClick={() => {
                void cartQuery.refetch()
                void wallets.refetch()
              }}
              className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
            >
              Tentar novamente
            </button>
          }
        />
      </div>
    )
  }

  if (session.status !== 'authenticated' || !viewer || !cartQuery.data || !wallets.data) {
    return <CheckoutSkeleton />
  }

  if (cartQuery.data.items.length === 0) {
    return (
      <div className="container-page py-10">
        <MobileScreenHeader title="Pagamento com carteira" className="mb-6" />
        <StatusMessage
          tone="empty"
          title="Seu carrinho está vazio"
          description="Adicione NFTs ao carrinho antes de seguir para o pagamento."
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
      </div>
    )
  }

  return (
    <CheckoutView
      user={session.user}
      viewer={viewer}
      cart={cartQuery.data}
      wallets={wallets.data.items}
    />
  )
}
