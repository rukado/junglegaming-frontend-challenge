import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { errorMessage } from '@/api/errors'
import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { pluralize } from '@/lib/format'
import { scrollToCatalog } from '../focus-search'
import { catalogQueryOptions } from '../queries'
import {
  catalogSearchDefaults,
  hasActiveFilters,
  toListParams,
  type CatalogSearch,
} from '../search'
import { CatalogFilters } from './catalog-filters'
import { CatalogPagination } from './catalog-pagination'
import { CatalogResults } from './catalog-results'
import { CatalogSearchInput } from './catalog-search-input'
import { CatalogSort, CatalogTabs } from './catalog-toolbar'
import { FeaturedBanner } from './featured-banner'

type CatalogSectionProps = {
  search: CatalogSearch
  onSearchChange: (patch: Partial<CatalogSearch>) => void
}

export function CatalogMobileSearch({ search, onSearchChange }: CatalogSectionProps) {
  const [open, setOpen] = useState(false)
  const { data } = useQuery(catalogQueryOptions(toListParams(search)))
  const activeCount =
    search.categories.length + search.networks.length + (search.minPrice || search.maxPrice ? 1 : 0)

  return (
    <div className="flex items-center gap-2 md:hidden">
      <CatalogSearchInput
        value={search.q}
        onCommit={(q) => onSearchChange({ q })}
        className="flex-1"
        inputId="busca-mobile"
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={activeCount ? `Filtros, ${activeCount} ativos` : 'Filtros'}
            className="relative flex size-[45px] shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(137deg,rgba(210,138,76,0.45)_24.6%,#d28a4c_100%)]"
          >
            <MaskIcon src={icons.filter} className="size-[22px] text-ink" />
            {activeCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-ink bg-text-accent text-2xs font-bold text-ink"
              >
                {activeCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-2xl border-border-soft bg-surface-card"
        >
          <SheetHeader>
            <SheetTitle className="text-lead">Filtrar e ordenar</SheetTitle>
            <SheetDescription>
              {data
                ? pluralize(data.total, 'NFT encontrado', 'NFTs encontrados')
                : 'Carregando resultados'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-6">
            <CatalogSort sort={search.sort} onChange={(sort) => onSearchChange({ sort })} />
            <CatalogFilters
              search={search}
              facets={data?.facets}
              onChange={onSearchChange}
              className="p-0"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 rounded-md bg-primary text-body-lg font-bold text-ink"
            >
              Ver resultados
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function CatalogSection({ search, onSearchChange }: CatalogSectionProps) {
  const params = toListParams(search)
  const query = useQuery(catalogQueryOptions(params))
  const { data } = query
  const filtersActive = hasActiveFilters(search)
  const resultsSummary = data
    ? data.total === 0
      ? 'Nenhum NFT encontrado.'
      : `${pluralize(data.total, 'NFT encontrado', 'NFTs encontrados')}. Página ${data.page} de ${Math.max(data.totalPages, 1)}.`
    : ''

  return (
    <section
      id="catalogo"
      aria-labelledby="catalogo-title"
      className="container-page mt-6 scroll-mt-4 md:mt-16 lg:mt-24"
    >
      <h2 id="catalogo-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <div className="flex items-start gap-12">
        <div className="hidden w-[310px] shrink-0 flex-col gap-6 lg:flex">
          <CatalogFilters search={search} facets={data?.facets} onChange={onSearchChange} />
          <FeaturedBanner />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-8 md:gap-[88px]">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="hidden md:block" id="busca">
              <CatalogSearchInput value={search.q} onCommit={(q) => onSearchChange({ q })} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CatalogTabs tab={search.tab} onChange={(tab) => onSearchChange({ tab })} />
              <div className="hidden md:block">
                <CatalogSort sort={search.sort} onChange={(sort) => onSearchChange({ sort })} />
              </div>
            </div>
            <div className="hidden md:block lg:hidden">
              <TabletFilters
                search={search}
                onSearchChange={onSearchChange}
                facets={data?.facets}
              />
            </div>
            <p aria-live="polite" className="sr-only">
              {query.isFetching && !query.isPending ? 'Atualizando resultados…' : resultsSummary}
            </p>
            <CatalogResults
              data={data}
              isPending={query.isPending}
              isError={query.isError}
              isFetching={query.isFetching}
              isPlaceholderData={query.isPlaceholderData}
              errorMessage={query.error ? errorMessage(query.error) : null}
              onRetry={() => void query.refetch()}
              onClearFilters={
                filtersActive
                  ? () =>
                      onSearchChange({
                        q: '',
                        categories: [],
                        networks: [],
                        minPrice: '',
                        maxPrice: '',
                        tab: catalogSearchDefaults.tab,
                      })
                  : null
              }
            />
          </div>
          {data && !query.isPlaceholderData && (
            <CatalogPagination
              page={data.page}
              totalPages={data.totalPages}
              onNavigate={scrollToCatalog}
            />
          )}
        </div>
      </div>
    </section>
  )
}

type TabletFiltersProps = CatalogSectionProps & {
  facets: Parameters<typeof CatalogFilters>[0]['facets']
}

function TabletFilters({ search, onSearchChange, facets }: TabletFiltersProps) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border-soft px-4 text-body font-bold text-text-accent"
        >
          <MaskIcon src={icons.filter} className="size-4" />
          Filtros
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto border-border-soft bg-surface-card">
        <SheetHeader>
          <SheetTitle className="text-lead">Filtros</SheetTitle>
          <SheetDescription>Combine coleções, faixa de preço e rede.</SheetDescription>
        </SheetHeader>
        <CatalogFilters
          search={search}
          facets={facets}
          onChange={onSearchChange}
          className="pt-0"
        />
      </SheetContent>
    </Sheet>
  )
}
