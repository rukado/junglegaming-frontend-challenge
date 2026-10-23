import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

type MaskIconProps = {
  src: string
  className?: string
  label?: string
}

export function MaskIcon({ src, className, label }: MaskIconProps) {
  const style = { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` } as CSSProperties
  return (
    <span
      className={cn('icon-mask size-5', className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
