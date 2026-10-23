import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuantityStepperProps = {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  label: string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'round'
  tone?: 'primary' | 'muted'
  className?: string
}

const sizeClasses = {
  xs: 'h-[30px] w-5',
  sm: 'h-[26px] w-5',
  md: 'h-[33px] w-[26px]',
  round: 'size-6',
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  disabled = false,
  size = 'md',
  tone = 'primary',
  className,
}: QuantityStepperProps) {
  const buttonClass = cn(
    'flex items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
    tone === 'primary'
      ? 'bg-primary text-ink hover:bg-text-accent'
      : 'bg-[#2f1d15] text-foreground hover:bg-surface-dark',
    sizeClasses[size],
  )
  const iconClass = size === 'md' ? 'size-4' : 'size-3.5'
  return (
    <fieldset className={cn('flex items-center', size === 'sm' ? 'gap-2.5' : 'gap-3', className)}>
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
          size === 'md' ? 'text-heading' : size === 'sm' ? 'text-lead' : 'text-[17px]',
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
