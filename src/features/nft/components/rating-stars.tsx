import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({
  average,
  count,
  compact = false,
}: {
  average: number
  count: number
  compact?: boolean
}) {
  const rounded = Math.round(average)
  if (compact) {
    return (
      <p className="inline-flex h-[27px] items-center gap-1 rounded-full bg-surface-dark px-3 text-body text-foreground">
        <Star aria-hidden="true" className="size-3.5 fill-primary text-primary" />
        <span className="font-bold">{average.toFixed(1)}</span>
        <span className="text-text-secondary">({count})</span>
        <span className="sr-only">de 5 estrelas, {count} avaliações</span>
      </p>
    )
  }
  return (
    <p className="flex items-center gap-1 text-body text-foreground">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              'size-[15px]',
              index < rounded ? 'fill-primary text-primary' : 'text-border-soft',
            )}
          />
        ))}
      </span>
      <span className="sr-only">Nota {average.toFixed(1)} de 5.</span>
      <span>{count} avaliações de colecionadores</span>
    </p>
  )
}
