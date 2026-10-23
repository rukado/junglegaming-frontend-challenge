import { Link } from '@tanstack/react-router'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Cart, Quote } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { formatEthAmount } from '@/lib/format'
import { cn } from '@/lib/utils'

type CheckoutSummaryProps = {
  cart: Cart
  quote: UseQueryResult<Quote>
  className?: string
}

function Value({ value }: { value: string | undefined }) {
  if (value === undefined)
    return <span className="skeleton-shimmer inline-block h-4 w-20 rounded-sm" />
  return <>{value}</>
}

export function CheckoutSummary({ cart, quote, className }: CheckoutSummaryProps) {
  const data = quote.data
  const stale = quote.isPlaceholderData
  const linesById = new Map(data?.lines.map((line) => [line.itemId, line]))

  return (
    <section
      aria-labelledby="checkout-summary-title"
      aria-busy={quote.isFetching || undefined}
      className={cn('flex flex-col gap-3', className)}
    >
      <h2
        id="checkout-summary-title"
        className="sr-only md:not-sr-only md:text-[17px] md:leading-4 md:font-bold md:text-foreground"
      >
        Seus NFTs
      </h2>
      <div
        aria-hidden="true"
        className="hidden justify-between border-b border-primary/30 pb-3 text-body-lg leading-4 text-foreground md:flex"
      >
        <span className="font-bold">NFTs</span>
        <span className="font-medium">Subtotal</span>
      </div>
      <ul className="hidden flex-col gap-3 md:flex">
        {cart.items.map((item) => {
          const line = linesById.get(item.id)
          return (
            <li
              key={item.id}
              className="flex min-h-[70px] items-center gap-3 bg-surface-card py-1 pr-3 pl-1"
            >
              <img
                src={item.image.sm}
                width={66}
                height={66}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-[66px] shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-lg leading-4 font-bold text-foreground">
                  {item.name}
                </p>
                <p className="mt-1.5 truncate text-body leading-4 text-sand">
                  ID do token: {item.tokenId}
                </p>
              </div>
              <span className="shrink-0 text-caption text-text-secondary">
                <span className="sr-only">Quantidade: </span>(x {item.quantity})
              </span>
              <span className="shrink-0 text-lead leading-4 font-bold whitespace-nowrap text-text-accent">
                <Value value={line && formatEthAmount(line.lineTotalEth)} />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="hidden text-center text-body text-foreground md:block">
        Tem um código promocional?{' '}
        <Link to="/cart" className="text-text-accent underline-offset-4 hover:underline">
          Aplique aqui
        </Link>
      </p>
      {quote.isError && !data ? (
        <div role="alert" className="flex flex-col gap-2 text-caption text-destructive">
          {errorMessage(quote.error)}
          <button
            type="button"
            onClick={() => void quote.refetch()}
            className="w-fit font-bold text-text-accent underline underline-offset-4"
          >
            Recalcular total
          </button>
        </div>
      ) : (
        <dl className={cn('flex flex-col gap-3 transition-opacity', stale && 'opacity-60')}>
          <div className="hidden items-center justify-between gap-4 md:flex">
            <dt className="text-[15px] text-foreground">Subtotal</dt>
            <dd className="text-lead text-foreground">
              <Value value={data && formatEthAmount(data.subtotalEth)} />
            </dd>
          </div>
          <div className="hidden items-center justify-between gap-4 md:flex">
            <dt className="text-[15px] text-foreground">
              {data?.coupon?.status === 'applied'
                ? `${data.coupon.label} (${data.coupon.code})`
                : 'Desconto do lançamento'}
            </dt>
            <dd className="text-[15px] text-foreground">
              <Value value={data && `(-) ${formatEthAmount(data.discountEth)}`} />
            </dd>
          </div>
          <div className="hidden items-start justify-between gap-4 md:flex">
            <dt className="text-[15px] text-foreground">Taxa de rede</dt>
            <dd className="flex flex-col items-end gap-1">
              <span className="text-lead text-foreground">
                <Value value={data && formatEthAmount(data.networkFeeEth, 3)} />
              </span>
              <span className="text-caption text-text-accent">Taxa estimada</span>
            </dd>
          </div>
          <div className="flex items-center justify-end gap-6 border-primary/30 pt-3 md:justify-between md:border-t md:px-10">
            <dt className="text-body-lg font-bold text-foreground">Total:</dt>
            <dd className="text-lead font-bold text-text-accent">
              <Value value={data && formatEthAmount(data.totalEth, 3)} />
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
