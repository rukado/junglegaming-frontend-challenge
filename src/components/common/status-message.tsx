import { AlertTriangle, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatusMessageProps = {
  tone: 'error' | 'empty'
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function StatusMessage({ tone, title, description, action, className }: StatusMessageProps) {
  const Icon = tone === 'error' ? AlertTriangle : SearchX
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-card px-6 py-10 text-center',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn('size-8', tone === 'error' ? 'text-destructive' : 'text-text-accent')}
      />
      <h2 className="text-lead font-bold text-foreground">{title}</h2>
      {description && <p className="max-w-md text-body text-text-secondary">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
