import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { BlogSection } from '@/features/catalog/components/blog-section'
import { CatalogMobileSearch, CatalogSection } from '@/features/catalog/components/catalog-section'
import { HomeHero } from '@/features/catalog/components/home-hero'
import { MobileHero } from '@/features/catalog/components/mobile-hero'
import { PromoCards } from '@/features/catalog/components/promo-cards'
import { scrollToCatalog } from '@/features/catalog/focus-search'
import { catalogQueryOptions, featuredQueryOptions } from '@/features/catalog/queries'
import {
  catalogSearchDefaults,
  catalogSearchSchema,
  toListParams,
  type CatalogSearch,
} from '@/features/catalog/search'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  search: { middlewares: [stripSearchParams(catalogSearchDefaults)] },
  loaderDeps: ({ search }) => toListParams(search),
  loader: ({ context, deps }) => {
    void context.queryClient.prefetchQuery(catalogQueryOptions(deps))
    void context.queryClient.prefetchQuery(featuredQueryOptions())
  },
  head: () => ({
    meta: [
      { title: 'Kurio · Marketplace de NFTs' },
      {
        name: 'description',
        content:
          'Descubra, filtre e colecione NFTs de criadores emergentes e consagrados na Kurio.',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const onSearchChange = useCallback(
    (patch: Partial<CatalogSearch>) => {
      void navigate({
        search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }),
        resetScroll: false,
      })
    },
    [navigate],
  )

  return (
    <>
      <div className="container-page flex flex-col gap-4 pt-4 md:hidden">
        <CatalogMobileSearch search={search} onSearchChange={onSearchChange} />
        <MobileHero onExplore={scrollToCatalog} />
      </div>
      <HomeHero onExplore={scrollToCatalog} />
      <CatalogSection search={search} onSearchChange={onSearchChange} />
      <PromoCards />
      <BlogSection />
    </>
  )
}
