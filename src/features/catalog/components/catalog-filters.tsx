import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import {
  categoryIds,
  categoryLabels,
  networkIds,
  networkLabels,
  type CategoryId,
  type NetworkId,
  type NftListResponse,
} from '@/api/contracts'
import { Slider } from '@/components/ui/slider'
import { formatDecimalPtBr } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CatalogSearch } from '../search'

type Facets = NftListResponse['facets']

type CatalogFiltersProps = {
  search: CatalogSearch
  facets: Facets | undefined
  onChange: (patch: Partial<CatalogSearch>) => void
  className?: string
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

type OptionRowProps = {
  label: string
  count: number | undefined
  checked: boolean
  onToggle: () => void
}

function OptionRow({ label, count, checked, onToggle }: OptionRowProps) {
  return (
    <li>
      <label
        className={cn(
          'relative flex w-full cursor-pointer items-center justify-between rounded-sm text-[15px] leading-10 transition-colors hover:text-text-accent has-focus-visible:outline-2 has-focus-visible:outline-ring',
          checked ? 'text-text-accent' : 'text-text-secondary',
        )}
      >
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="absolute inset-0 z-10 cursor-pointer appearance-none opacity-0"
          />
          <Check
            aria-hidden="true"
            className={cn(
              'size-3.5 shrink-0 transition-opacity',
              checked ? 'opacity-100' : 'opacity-0',
            )}
          />
          {label}
        </span>
        <span className={cn('font-bold', count === undefined && 'opacity-0')}>
          <span className="sr-only">, </span>({count ?? 0})<span className="sr-only"> itens</span>
        </span>
      </label>
    </li>
  )
}

function centsOf(value: string) {
  return Math.round(Number(value) * 100)
}

function PriceFilter({
  search,
  facets,
  onChange,
}: Pick<CatalogFiltersProps, 'search' | 'facets' | 'onChange'>) {
  const labelId = useId()
  const min = facets ? Math.floor(Number(facets.priceRange.min) * 100) : 0
  const max = facets ? Math.ceil(Number(facets.priceRange.max) * 100) : 1000
  const [draft, setDraft] = useState<[number, number]>([
    search.minPrice ? centsOf(search.minPrice) : min,
    search.maxPrice ? centsOf(search.maxPrice) : max,
  ])
  const [low, high] = draft

  function apply() {
    onChange({
      minPrice: low <= min ? '' : (low / 100).toFixed(2),
      maxPrice: high >= max ? '' : (high / 100).toFixed(2),
    })
  }

  return (
    <div className="flex flex-col gap-3 pl-3">
      <Slider
        min={min}
        max={max}
        step={1}
        minStepsBetweenThumbs={1}
        value={draft}
        disabled={!facets}
        onValueChange={(value) => setDraft([value[0] ?? min, value[1] ?? max])}
        thumbLabels={['Preço mínimo', 'Preço máximo']}
        aria-labelledby={labelId}
        className="py-2"
      />
      <p id={labelId} className="text-[15px] leading-none text-foreground">
        Preço: {formatDecimalPtBr(low / 100)} - {formatDecimalPtBr(high / 100)} ETH
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={apply}
          disabled={!facets}
          className="rounded-md bg-primary px-3 py-2 text-body-lg font-bold text-ink transition-colors hover:bg-text-accent disabled:opacity-50"
        >
          Aplicar
        </button>
        {(search.minPrice || search.maxPrice) && (
          <button
            type="button"
            onClick={() => onChange({ minPrice: '', maxPrice: '' })}
            className="text-body text-text-secondary underline-offset-4 hover:text-text-accent hover:underline"
          >
            Limpar preço
          </button>
        )}
      </div>
    </div>
  )
}

export function CatalogFilters({ search, facets, onChange, className }: CatalogFiltersProps) {
  const categoryCount = (id: CategoryId) => facets?.categories.find((item) => item.id === id)?.count
  const networkCount = (id: NetworkId) => facets?.networks.find((item) => item.id === id)?.count
  const priceKey = `${search.minPrice}|${search.maxPrice}|${facets?.priceRange.min ?? ''}|${facets?.priceRange.max ?? ''}`

  return (
    <div className={cn('flex flex-col gap-10 bg-surface-card p-5', className)}>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lead leading-4 font-bold text-foreground">Coleções</legend>
        <ul className="px-3">
          {categoryIds.map((id) => (
            <OptionRow
              key={id}
              label={categoryLabels[id]}
              count={categoryCount(id)}
              checked={search.categories.includes(id)}
              onToggle={() => onChange({ categories: toggle(search.categories, id) })}
            />
          ))}
        </ul>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lead leading-4 font-bold text-foreground">
          Faixa de preço
        </legend>
        <PriceFilter key={priceKey} search={search} facets={facets} onChange={onChange} />
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lead leading-4 font-bold text-foreground">Rede</legend>
        <ul className="pl-3">
          {networkIds.map((id) => (
            <OptionRow
              key={id}
              label={networkLabels[id]}
              count={networkCount(id)}
              checked={search.networks.includes(id)}
              onToggle={() => onChange({ networks: toggle(search.networks, id) })}
            />
          ))}
        </ul>
      </fieldset>
    </div>
  )
}
