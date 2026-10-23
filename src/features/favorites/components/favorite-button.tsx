import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFavorites, useToggleFavorite } from '../queries'

type FavoriteButtonProps = {
  nftId: string
  name: string
  variant?: 'icon' | 'labeled'
  className?: string
}

export function FavoriteButton({ nftId, name, variant = 'icon', className }: FavoriteButtonProps) {
  const { ids } = useFavorites()
  const { toggle } = useToggleFavorite()
  const active = ids.has(nftId)
  const label = `Favoritar ${name}`

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        aria-pressed={active}
        aria-label={label}
        onClick={() => toggle({ nftId, favorite: !active, name })}
        className={cn(
          'inline-flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border border-primary text-body leading-5 font-medium text-text-accent transition-colors hover:bg-surface-dark',
          active && 'bg-surface-dark',
          className,
        )}
      >
        <Heart aria-hidden="true" className={cn('size-5', active && 'fill-current')} />
        Favoritar
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle({ nftId, favorite: !active, name })
      }}
      className={cn(
        'flex size-[35px] items-center justify-center rounded-full border border-border bg-[#2f1d15] text-text-secondary transition-colors hover:text-text-accent',
        active && 'text-text-accent',
        className,
      )}
    >
      <Heart aria-hidden="true" className={cn('size-[18px]', active && 'fill-current')} />
    </button>
  )
}
