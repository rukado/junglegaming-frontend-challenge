import { createFileRoute } from '@tanstack/react-router'
import { HomeHero } from '@/features/catalog/components/home-hero'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HomeHero />
      <section id="catalogo" aria-label="Catálogo" className="container-page scroll-mt-6 py-12" />
    </>
  )
}
