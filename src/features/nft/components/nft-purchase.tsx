import { ShoppingCart } from 'lucide-react'
import type { Edition, NftDetail } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'
import { QuantityStepper } from '@/components/common/quantity-stepper'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { formatEthAmount } from '@/lib/format'
import { usePurchase } from '../use-purchase'

type NftPurchaseProps = {
  nft: NftDetail
  edition: Edition | undefined
}

export function NftPurchase({ nft, edition }: NftPurchaseProps) {
  const purchase = usePurchase(nft, edition)
  const priceLabel = edition ? formatEthAmount(edition.priceEth) : '—'

  return (
    <>
      <div className="hidden flex-col gap-2 md:flex">
        <div className="flex items-center justify-between gap-4">
          <QuantityStepper
            label="Quantidade"
            value={purchase.quantity}
            max={Math.max(1, purchase.limit)}
            onChange={purchase.setQuantity}
            disabled={purchase.unavailable}
          />
          <div className="flex gap-2">
            <ActionButton
              onClick={purchase.buyNow}
              disabled={purchase.unavailable}
              pending={purchase.pending}
              pendingLabel="Adicionando…"
              className="h-10 w-[130px] px-0 text-body"
            >
              {purchase.soldOut ? 'ESGOTADO' : 'COMPRAR'}
            </ActionButton>
            <FavoriteButton nftId={nft.id} name={nft.name} variant="labeled" />
          </div>
        </div>
        <p className="text-caption text-text-secondary" aria-live="polite">
          {purchase.availabilityMessage}
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[30px] border-t border-border bg-surface-card px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(10,6,4,0.45)] md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-body-lg text-text-secondary">Qtd.</span>
            <QuantityStepper
              size="sm"
              label="Quantidade"
              value={purchase.quantity}
              max={Math.max(1, purchase.limit)}
              onChange={purchase.setQuantity}
              disabled={purchase.unavailable}
            />
          </div>
          <p className="text-lead font-bold text-text-accent">{priceLabel}</p>
        </div>
        <p className="mt-2 text-caption text-text-secondary" aria-live="polite">
          {purchase.availabilityMessage}
        </p>
        <div className="mt-3 flex gap-3">
          <ActionButton
            onClick={purchase.buyNow}
            disabled={purchase.unavailable}
            pending={purchase.pending}
            pendingLabel="Adicionando…"
            className="h-[60px] flex-1 rounded-[14px] text-body-lg"
          >
            {purchase.soldOut ? 'Esgotado' : 'Comprar NFT'}
          </ActionButton>
          <button
            type="button"
            onClick={purchase.addOnly}
            disabled={purchase.unavailable || purchase.pending}
            aria-label="Adicionar ao carrinho"
            className="flex size-[60px] shrink-0 items-center justify-center rounded-[14px] border border-primary text-text-accent disabled:opacity-50"
          >
            <ShoppingCart aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </>
  )
}
