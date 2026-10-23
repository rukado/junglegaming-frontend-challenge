import { Link } from '@tanstack/react-router'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Cart, Quote } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { formatEthAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CouponField } from './coupon-field'

type CartSummaryProps = {
  cart: Cart
  quote: UseQueryResult<Quote>
  busy: boolean
  className?: string
}

function Amount({ value, loading }: { value: string | undefined; loading: boolean }) {
  if (value === undefined)
    return loading ? <span className="skeleton-shimmer inline-block h-4 w-20 rounded-sm" /> : '—'
  return <>{value}</>
}

export function CartSummary({ cart, quote, busy, className }: CartSummaryProps) {
  const data = quote.data
  const stale =
    busy || quote.isPlaceholderData || (data !== undefined && data.cartVersion !== cart.version)
  const loading = quote.isPending || stale
  const canCheckout = data !== undefined && data.purchasable && !stale && !quote.isError

  let blocker: string | null = null
  if (quote.isError && !data) blocker = errorMessage(quote.error)
  else if (data && !data.purchasable && !stale)
    blocker =
      data.coupon && data.coupon.status !== 'applied'
        ? 'Remova o cupom inválido para continuar.'
        : 'Revise os itens marcados no carrinho para continuar.'

  return (
    <section
      aria-labelledby="cart-summary-title"
      aria-busy={loading || undefined}
      className={cn(
        'flex flex-col gap-6 rounded-t-[40px] bg-surface-card px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:rounded-none md:bg-transparent md:p-0',
        className,
      )}
    >
      <h2
        id="cart-summary-title"
        className="sr-only md:not-sr-only md:border-b md:border-primary/30 md:pb-3 md:text-lead md:leading-4 md:font-bold md:text-foreground"
      >
        Resumo da carteira
      </h2>

      <CouponField appliedCode={cart.couponCode} coupon={data?.coupon} />

      <dl className={cn('flex flex-col gap-3 transition-opacity', stale && data && 'opacity-60')}>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[15px] text-foreground">Subtotal</dt>
          <dd className="text-body-lg text-foreground md:text-lead">
            <Amount value={data && formatEthAmount(data.subtotalEth)} loading={loading} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[15px] text-foreground">
            {data?.coupon?.status === 'applied' ? data.coupon.label : 'Desconto do lançamento'}
          </dt>
          <dd className="text-[15px] text-foreground">
            <Amount value={data && `(-) ${formatEthAmount(data.discountEth)}`} loading={loading} />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[15px] text-foreground">Taxa de rede</dt>
          <dd className="flex flex-col items-end gap-1">
            <span className="text-body-lg text-foreground md:text-lead">
              <Amount value={data && formatEthAmount(data.networkFeeEth, 3)} loading={loading} />
            </span>
            <span className="text-caption text-text-accent">Taxa estimada</span>
          </dd>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 md:mt-6">
          <dt className="text-body-lg font-bold text-foreground">Total</dt>
          <dd className="text-lead font-bold text-text-accent">
            <Amount value={data && formatEthAmount(data.totalEth, 3)} loading={loading} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col items-center gap-3">
        {blocker && (
          <p role="alert" className="self-stretch text-caption text-destructive">
            {blocker}
          </p>
        )}
        {quote.isError && (
          <button
            type="button"
            onClick={() => void quote.refetch()}
            className="self-stretch text-left text-caption text-text-accent underline underline-offset-4"
          >
            Recalcular total
          </button>
        )}
        {canCheckout ? (
          <Link
            to="/checkout"
            className="flex h-[60px] w-full items-center justify-center rounded-full bg-linear-to-r from-primary to-[#9b6537] text-body-lg font-bold text-ink transition-opacity hover:opacity-90 md:h-10 md:rounded-[3px] md:bg-primary md:bg-none md:text-[15px] md:hover:bg-text-accent"
          >
            Conectar e finalizar
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-[60px] w-full cursor-not-allowed items-center justify-center rounded-full bg-primary text-body-lg font-bold text-ink opacity-50 md:h-10 md:rounded-[3px] md:text-[15px]"
          >
            {loading && !quote.isError ? 'Calculando total…' : 'Conectar e finalizar'}
          </button>
        )}
        <Link
          to="/"
          hash="catalogo"
          className="hidden text-[15px] text-text-accent underline-offset-4 hover:underline md:block"
        >
          Continuar explorando
        </Link>
      </div>
    </section>
  )
}
