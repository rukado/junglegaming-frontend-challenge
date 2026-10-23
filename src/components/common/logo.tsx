import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Kurio, página inicial"
      className={cn(
        'inline-flex h-[34px] items-center text-body font-bold leading-none tracking-[1.4px] text-foreground',
        className,
      )}
    >
      KURIO
    </Link>
  )
}
