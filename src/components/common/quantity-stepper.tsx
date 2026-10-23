import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuantityStepperProps = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  label: string
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const buttonClass = cn(
    'flex items-center justify-center rounded-full bg-primary text-ink transition-colors hover:bg-text-accent disabled:cursor-not-allowed disabled:opacity-40',
    size === 'md' ? 'h-[33px] w-[26px]' : 'h-[26px] w-5',
  )
  const iconClass = size === 'md' ? 'size-4' : 'size-3.5'
  return (
    <fieldset className={cn('flex items-center', size === 'md' ? 'gap-3' : 'gap-2.5', className)}>
      <legend className="sr-only">{label}</legend>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={buttonClass}
      >
        <Minus aria-hidden="true" strokeWidth={3} className={iconClass} />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'min-w-[2ch] text-center text-foreground',
          size === 'md' ? 'text-heading' : 'text-lead',
        )}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={buttonClass}
      >
        <Plus aria-hidden="true" strokeWidth={3} className={iconClass} />
      </button>
    </fieldset>
  )
}
