import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'
import { requireSession } from '@/features/auth/guards'

export const Route = createFileRoute('/profile')({
  beforeLoad: requireSession,
  component: ProfilePage,
})

function ProfilePage() {
  return <PageShell title="Perfil do colecionador" />
}
