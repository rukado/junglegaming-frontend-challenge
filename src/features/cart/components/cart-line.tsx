import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { editionLabels, type CartItem, type QuoteLine } from '@/api/contracts'
import { QuantityStepper } from '@/components/common/quantity-stepper'
import { formatEthAmount } from '@/lib/format'
import { multiplyEth } from '@/lib/money'
import { cn } from '@/lib/utils'

type CartLineProps = {
  item: CartItem
  quoteLine: QuoteLine | undefined
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  removing: boolean
}

function lineNotice(line: QuoteLine | undefined) {
  if (!line || line.status === 'ok') return null
  if (line.status === 'sold_out') return 'Esgotado. Remova este item para continuar.'
  if (line.status === 'insufficient')
    return `Só ${line.available === 1 ? 'resta 1 unidade' : `restam ${line.available} unidades`}. Ajuste a quantidade.`
  if (line.previousUnitPriceEth)
    return `Preço atualizado de ${formatEthAmount(line.previousUnitPriceEth)} para ${formatEthAmount(line.unitPriceEth)}.`
  return null
}

export function CartLine({ item, quoteLine, onQuantityChange, onRemove, removing }: CartLineProps) {
  const unitPrice = quoteLine?.unitPriceEth ?? item.unitPriceEth
  const lineTotal = multiplyEth(unitPrice, item.quantity)
  const limit = Math.min(item.available, item.maxPerOrder)
  const soldOut = quoteLine?.status === 'sold_out' || item.available === 0
  const notice = lineNotice(quoteLine)
  const priceChanged = quoteLine?.status === 'price_changed' && quoteLine.previousUnitPriceEth
  const stepperLabel = `Quantidade de ${item.name}`
  const removeLabel = `Remover ${item.name} do carrinho`
  const tokenLabel = `ID do token: ${item.tokenId}`
  const editionLabel = `Edição: ${editionLabels[item.editionKind]}`
  const noticeTone = quoteLine?.status === 'price_changed' ? 'text-text-accent' : 'text-destructive'

  const price = (
    <>
      {priceChanged && (
        <s className="block text-caption font-normal text-sand">
          <span className="sr-only">Preço anterior: </span>
          {formatEthAmount(quoteLine.previousUnitPriceEth ?? unitPrice)}
        </s>
      )}
      {formatEthAmount(unitPrice)}
    </>
  )

  return (
    <li className={cn('transition-opacity', removing && 'pointer-events-none opacity-50')}>
      <div className="hidden min-h-[70px] grid-cols-[minmax(0,250px)_minmax(0,1fr)_125px_minmax(0,1fr)_24px] items-center gap-x-4 bg-surface-card pr-6 md:grid lg:grid-cols-[311px_139px_136px_148px_24px] lg:gap-x-0">
        <div className="flex min-w-0 items-center gap-4">
          <img
            src={item.image.sm}
            srcSet={`${item.image.sm} 160w, ${item.image.md} 320w`}
            sizes="70px"
            width={70}
            height={70}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-[70px] shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <Link
              to="/nft/$nftId"
              params={{ nftId: item.nftId }}
              search={{ edition: item.editionId }}
              className="block truncate text-body-lg leading-4 font-bold text-foreground hover:text-text-accent"
            >
              {item.name}
            </Link>
            <p className="mt-1.5 truncate text-body leading-4 text-sand">
              {tokenLabel} · {editionLabels[item.editionKind]}
            </p>
          </div>
        </div>
        <p className="text-body-lg leading-4 font-bold whitespace-nowrap text-text-secondary">
          {price}
        </p>
        <QuantityStepper
          size="xs"
          label={stepperLabel}
          value={item.quantity}
          max={Math.max(1, limit)}
          onChange={onQuantityChange}
          disabled={soldOut || removing}
        />
        <p className="text-body-lg leading-4 font-bold whitespace-nowrap text-text-accent">
          <span className="sr-only">Total do item: </span>
          {formatEthAmount(lineTotal)}
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={removeLabel}
          className="flex size-6 items-center justify-center text-sand transition-colors hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-5" />
        </button>
        {notice && (
          <p className={cn('col-span-full pb-3 pl-[86px] text-caption', noticeTone)}>{notice}</p>
        )}
      </div>

      <div className="relative flex min-h-[100px] rounded-[14px] bg-[linear-gradient(139.5deg,#241612_12%,#2f1d15_106.6%)] md:hidden">
        <img
          src={item.image.sm}
          srcSet={`${item.image.sm} 160w, ${item.image.md} 320w`}
          sizes="100px"
          width={100}
          height={100}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-[100px] shrink-0 rounded-[14px] object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col py-3 pr-3 pl-2.5">
          <Link
            to="/nft/$nftId"
            params={{ nftId: item.nftId }}
            search={{ edition: item.editionId }}
            className="truncate pr-7 text-[15px] leading-4 font-bold text-foreground"
          >
            {item.name}
          </Link>
          <p className="mt-1.5 text-body leading-4 text-text-secondary">{editionLabel}</p>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <p className="text-lead leading-4 font-bold text-text-accent">{price}</p>
            <QuantityStepper
              size="round"
              tone="muted"
              label={stepperLabel}
              value={item.quantity}
              max={Math.max(1, limit)}
              onChange={onQuantityChange}
              disabled={soldOut || removing}
              className="gap-2.5"
            />
          </div>
          {notice && <p className={cn('mt-2 text-caption', noticeTone)}>{notice}</p>}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={removeLabel}
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full text-sand transition-colors hover:text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-[18px]" />
        </button>
      </div>
    </li>
  )
}
