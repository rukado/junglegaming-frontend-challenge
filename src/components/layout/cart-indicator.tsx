import { Link } from '@tanstack/react-router'
import { MaskIcon } from '@/components/common/mask-icon'
import { icons } from '@/components/common/icons'
import { cn } from '@/lib/utils'

type CartIndicatorProps = {
  count: number
  className?: string
}

export function CartIndicator({ count, className }: CartIndicatorProps) {
  const label =
    count > 0 ? `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Carrinho vazio'
  return (
    <Link
      to="/cart"
      aria-label={label}
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-md',
        className,
      )}
    >
      <MaskIcon src={icons.cart} className="h-6 w-6 text-foreground" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0 flex size-[18px] items-center justify-center rounded-full border-2 border-ink bg-primary text-2xs font-medium text-ink"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
