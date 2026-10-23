import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useId, useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  hint?: string
  hideLabel?: boolean
  required?: boolean
  trailing?: ReactNode
  inputClassName?: string
}

export const inputBaseClass =
  'h-10 w-full rounded-sm border border-border bg-transparent px-4 text-body text-foreground outline-none transition-colors placeholder:text-sand focus-visible:border-text-accent focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive disabled:opacity-60'

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  {
    label,
    error,
    hint,
    hideLabel = false,
    required,
    trailing,
    className,
    inputClassName,
    id,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className={cn('text-body text-foreground', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-lead leading-none text-[#e8664a]">
            *
          </span>
        )}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(inputBaseClass, trailing && 'pr-12', inputClassName)}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-caption text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  )
})

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type' | 'trailing'>>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false)
    const Icon = visible ? EyeOff : Eye
    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            className="flex size-8 items-center justify-center rounded-sm text-sand hover:text-text-accent"
          >
            <Icon aria-hidden="true" className="size-[18px]" />
          </button>
        }
        {...props}
      />
    )
  },
)

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-caption text-destructive"
    >
      {message}
    </p>
  )
}
