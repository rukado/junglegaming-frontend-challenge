import { useId } from 'react'
import {
  catalogTabLabels,
  catalogTabs,
  sortLabels,
  sortOptions,
  type CatalogTab,
  type SortOption,
} from '@/api/contracts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type CatalogTabsProps = {
  tab: CatalogTab
  onChange: (tab: CatalogTab) => void
  className?: string
}

export function CatalogTabs({ tab, onChange, className }: CatalogTabsProps) {
  return (
    <fieldset
      className={cn(
        'flex min-w-0 max-w-full items-start gap-4 overflow-x-auto md:gap-5',
        className,
      )}
    >
      <legend className="sr-only">Seleção do catálogo</legend>
      {catalogTabs.map((value) => {
        const active = value === tab
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              'relative shrink-0 pb-1.5 text-body leading-4 whitespace-nowrap transition-colors md:text-[15px] md:font-medium',
              'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:content-[""]',
              active
                ? 'font-bold text-text-accent after:bg-primary'
                : 'text-foreground after:bg-transparent hover:text-text-accent',
            )}
          >
            {catalogTabLabels[value]}
          </button>
        )
      })}
    </fieldset>
  )
}

type CatalogSortProps = {
  sort: SortOption
  onChange: (sort: SortOption) => void
}

export function CatalogSort({ sort, onChange }: CatalogSortProps) {
  const labelId = useId()
  return (
    <div className="flex items-center gap-2">
      <span id={labelId} className="text-[15px] whitespace-nowrap text-foreground">
        Ordenar por:
      </span>
      <Select value={sort} onValueChange={(value) => onChange(value as SortOption)}>
        <SelectTrigger
          aria-labelledby={labelId}
          className="h-8 border-transparent bg-transparent px-1 text-[15px] text-foreground hover:bg-surface-card dark:bg-transparent [&_svg]:text-foreground"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="border-border-soft bg-surface-card">
          {sortOptions.map((value) => (
            <SelectItem key={value} value={value}>
              {sortLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
