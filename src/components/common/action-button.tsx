import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type ActionButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'outline' | 'ghost'
  pending?: boolean
  pendingLabel?: string
}

const variants = {
  primary: 'bg-primary text-ink hover:bg-text-accent disabled:hover:bg-primary',
  outline: 'border border-primary text-text-accent hover:bg-surface-dark',
  ghost: 'text-text-accent hover:bg-surface-dark',
}

export function ActionButton({
  variant = 'primary',
  pending = false,
  pendingLabel,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-body font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {pending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  )
}
