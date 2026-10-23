import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type SelectFieldProps<T extends string> = {
  label: string
  value: T | ''
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
  placeholder?: string
  error?: string
  required?: boolean
  hideLabel?: boolean
  className?: string
  triggerClassName?: string
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  required,
  hideLabel = false,
  className,
  triggerClassName,
}: SelectFieldProps<T>) {
  const labelId = useId()
  const errorId = useId()
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span id={labelId} className={cn('text-body text-foreground', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-lead leading-none text-[#e8664a]">
            *
          </span>
        )}
      </span>
      <Select value={value || undefined} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required || undefined}
          className={cn(
            'h-10! w-full rounded-sm border-border bg-transparent px-3 text-body text-foreground data-placeholder:text-sand dark:bg-transparent [&_svg]:text-foreground',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-border-soft bg-surface-card">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
