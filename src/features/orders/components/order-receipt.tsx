import { ExternalLink } from 'lucide-react'
import { networkLabels, walletTypeLabels, type Order } from '@/api/contracts'
import thankYou from '@/assets/icons/thank-you.svg'
import { formatDate, formatEthAmount, shortenHash } from '@/lib/format'

function MetaItem({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className={strong ? 'font-bold' : undefined}>{label}</dt>
      <dd className="truncate text-[15px]">{value}</dd>
    </div>
  )
}

export function OrderReceipt({ order }: { order: Order }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-4 px-6 pt-2 pb-8 md:pt-0">
        <img src={thankYou} width={80} height={80} alt="" className="size-20" />
        <p className="text-center text-body-lg leading-4 font-bold text-text-secondary">
          Seus NFTs agora estão na sua carteira
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-y border-primary px-6 py-3 text-body text-text-secondary md:flex md:justify-between md:gap-0 md:px-9 md:[&>div+div]:border-l md:[&>div+div]:border-primary md:[&>div+div]:pl-4">
        <MetaItem
          label="ID da transação"
          value={order.txHash ? shortenHash(order.txHash) : '—'}
          strong
        />
        <MetaItem label="Data" value={formatDate(order.settledAt ?? order.createdAt)} />
        <MetaItem label="Total" value={formatEthAmount(order.totalEth, 3)} />
        <MetaItem label="Carteira" value={walletTypeLabels[order.wallet.type]} strong />
      </dl>
      <section aria-labelledby="receipt-details" className="flex flex-col gap-3 px-6 pt-5 md:px-11">
        <h3 id="receipt-details" className="text-[15px] leading-4 font-bold text-foreground">
          Detalhes da transação
        </h3>
        <div
          aria-hidden="true"
          className="grid grid-cols-[minmax(0,1fr)_44px_84px] md:grid-cols-[1fr_70px_100px] border-b border-primary/30 pb-3 text-body-lg leading-4 text-foreground"
        >
          <span className="font-bold">NFTs</span>
          <span className="font-medium">
            <span className="md:hidden">Qtd.</span>
            <span className="hidden md:inline">Edições</span>
          </span>
          <span className="text-right font-medium">Subtotal</span>
        </div>
        <ul className="flex flex-col gap-3">
          {order.lines.map((line) => (
            <li
              key={line.itemId}
              className="grid grid-cols-[minmax(0,1fr)_44px_84px] md:grid-cols-[1fr_70px_100px] items-center bg-surface-card"
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={line.image.sm}
                  width={66}
                  height={66}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-14 shrink-0 rounded-lg object-cover md:size-[66px]"
                />
                <div className="min-w-0">
                  <p className="truncate text-body-lg leading-4 font-bold text-foreground">
                    {line.name}
                  </p>
                  <p className="mt-1.5 truncate text-body leading-4 text-sand">
                    ID do token: {line.tokenId}
                  </p>
                </div>
              </div>
              <span className="text-caption text-text-secondary">
                <span className="sr-only">Quantidade: </span>(x {line.quantity})
              </span>
              <span className="text-right text-lead leading-4 font-bold whitespace-nowrap text-text-accent">
                {formatEthAmount(line.lineTotalEth)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="ml-auto flex w-full max-w-[321px] flex-col gap-3 pt-2">
          {order.couponCode && (
            <div className="flex items-center justify-between">
              <dt className="text-[15px] text-foreground">Desconto ({order.couponCode})</dt>
              <dd className="text-[15px] text-foreground">
                (-) {formatEthAmount(order.discountEth)}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-[15px] text-foreground">Taxa de rede</dt>
            <dd className="text-lead text-foreground">{formatEthAmount(order.networkFeeEth, 3)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-body-lg font-bold text-foreground">Total</dt>
            <dd className="text-lead font-bold text-text-accent">
              {formatEthAmount(order.totalEth, 3)}
            </dd>
          </div>
        </dl>
      </section>
      <div className="mx-6 mt-3 flex flex-col items-center gap-5 border-t border-primary/30 pt-3 pb-10 md:mx-11">
        <p className="text-center text-body leading-[21px] text-text-secondary">
          Transação confirmada na {networkLabels[order.network]}. A propriedade foi transferida para
          sua carteira conectada e registrada na rede.
        </p>
        {order.explorerUrl && (
          <a
            href={order.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-primary px-4 text-body-lg font-bold text-ink transition-colors hover:bg-text-accent"
          >
            Ver no Etherscan
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">(explorador simulado, abre em nova aba)</span>
          </a>
        )}
      </div>
    </div>
  )
}
