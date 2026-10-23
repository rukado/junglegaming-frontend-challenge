import { useIsMutating } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import type { CartItem, NetworkId } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { StatusMessage } from '@/components/common/status-message'
import { MobileScreenHeader } from '@/components/layout/mobile-screen-header'
import { RelatedNfts } from '@/features/nft/components/related-nfts'
import {
  useAcceptCartChanges,
  useAddToCart,
  useCart,
  useQuote,
  useRemoveCartItem,
  useUpdateCartItem,
} from '../queries'
import { CartChangesNotice } from './cart-changes-notice'
import { CartLine } from './cart-line'
import { CartSkeleton } from './cart-skeleton'
import { CartSummary } from './cart-summary'

const estimateNetwork: NetworkId = 'ethereum'

export function CartView() {
  const { viewer, query } = useCart()
  const cart = query.data
  const quote = useQuote(viewer, cart, estimateNetwork)
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const addItem = useAddToCart()
  const acceptChanges = useAcceptCartChanges()
  const writing =
    useIsMutating({ predicate: (mutation) => mutation.options.scope?.id === 'cart' }) > 0
  const [removing, setRemoving] = useState<string | null>(null)

  function changeQuantity(item: CartItem, quantity: number) {
    updateItem.mutate(
      { itemId: item.id, quantity },
      { onError: (error) => toast.error(errorMessage(error)) },
    )
  }

  async function remove(item: CartItem) {
    setRemoving(item.id)
    try {
      await removeItem.mutateAsync(item.id)
      toast.success(`${item.name} removido do carrinho.`, {
        action: {
          label: 'Desfazer',
          onClick: () =>
            addItem.mutate(
              { nftId: item.nftId, editionId: item.editionId, quantity: item.quantity },
              { onError: (error) => toast.error(errorMessage(error)) },
            ),
        },
      })
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setRemoving(null)
    }
  }

  function accept() {
    acceptChanges.mutate(undefined, {
      onSuccess: () => toast.success('Carrinho atualizado com os valores atuais.'),
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  let content
  if (query.isError && !cart) {
    content = (
      <StatusMessage
        tone="error"
        title="Não foi possível carregar o carrinho"
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
  } else if (!cart) {
    content = <CartSkeleton />
  } else if (cart.items.length === 0) {
    content = (
      <StatusMessage
        tone="empty"
        title="Seu carrinho está vazio"
        description="Explore o mercado e adicione NFTs para continuar."
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
  }

  const hasItems = cart !== undefined && cart.items.length > 0

  return (
    <>
      <div className="flex min-h-dvh flex-col md:block md:min-h-0">
        <div className="container-page flex flex-1 flex-col pt-8 md:pt-6">
          <MobileScreenHeader title="Carrinho de NFTs" className="mb-3" />
          <nav
            aria-label="Trilha de navegação"
            className="mb-3 hidden text-[15px] leading-4 font-bold text-foreground md:block"
          >
            <ol className="flex gap-1">
              <li>
                <Link to="/" className="hover:text-text-accent">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/" hash="catalogo" className="hover:text-text-accent">
                  Mercado
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Carrinho</li>
            </ol>
          </nav>
          <h1 className="sr-only hidden md:block">Carrinho de NFTs</h1>

          <div className="flex flex-1 flex-col gap-8 lg:grid lg:grid-cols-[782fr_332fr] lg:gap-[86px]">
            <section aria-label="Itens do carrinho" className="flex flex-col gap-3 pb-6 md:pb-0">
              <div
                aria-hidden="true"
                className="hidden grid-cols-[minmax(0,250px)_minmax(0,1fr)_125px_minmax(0,1fr)_24px] gap-x-4 border-b border-primary/30 pb-3 text-body-lg leading-4 text-foreground md:grid lg:grid-cols-[311px_139px_136px_148px_24px] lg:gap-x-0"
              >
                <span className="font-bold">NFTs</span>
                <span className="font-medium">Preço</span>
                <span className="font-bold">Edições</span>
                <span className="font-medium">Total</span>
              </div>
              {quote.data && cart && quote.data.cartVersion === cart.version && (
                <CartChangesNotice
                  quote={quote.data}
                  pending={acceptChanges.isPending}
                  onAccept={accept}
                />
              )}
              {content}
              {hasItems && (
                <ul className="flex flex-col gap-5 md:gap-3">
                  {cart.items.map((item) => (
                    <CartLine
                      key={item.id}
                      item={item}
                      quoteLine={quote.data?.lines.find((line) => line.itemId === item.id)}
                      onQuantityChange={(quantity) => changeQuantity(item, quantity)}
                      onRemove={() => void remove(item)}
                      removing={removing === item.id}
                    />
                  ))}
                </ul>
              )}
            </section>
            {hasItems && (
              <CartSummary
                cart={cart}
                quote={quote}
                busy={writing}
                className="-mx-4 mt-auto md:mx-0 md:mt-0"
              />
            )}
          </div>
        </div>
      </div>
      {hasItems && cart.items[0] && (
        <div className="hidden md:block">
          <RelatedNfts nftId={cart.items[0].nftId} title="Colecionadores também viram" />
        </div>
      )}
    </>
  )
}
