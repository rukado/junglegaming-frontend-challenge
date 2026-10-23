import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageShellProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageShell({ title, description, children, className }: PageShellProps) {
  return (
    <div className={cn('container-page py-8 md:py-12', className)}>
      <h1 className="text-heading font-bold text-foreground">{title}</h1>
      {description && <p className="mt-2 text-body text-text-secondary">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
