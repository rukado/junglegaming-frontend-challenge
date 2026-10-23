import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'
import { requireSession } from '@/features/auth/guards'

export const Route = createFileRoute('/favorites')({
  beforeLoad: requireSession,
  component: FavoritesPage,
})

function FavoritesPage() {
  return <PageShell title="Favoritos" />
}
