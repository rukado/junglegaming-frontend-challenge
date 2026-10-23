import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ComingSoonProps = {
  children: ReactNode
  className?: string
}

export function ComingSoon({ children, className }: ComingSoonProps) {
  return (
    <span
      aria-disabled="true"
      title="Em breve"
      className={cn('cursor-not-allowed opacity-70', className)}
    >
      {children}
      <span className="sr-only"> (em breve)</span>
    </span>
  )
}
