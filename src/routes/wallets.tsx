import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'
import { requireSession } from '@/features/auth/guards'

export const Route = createFileRoute('/wallets')({
  beforeLoad: requireSession,
  component: WalletsPage,
})

function WalletsPage() {
  return <PageShell title="Carteiras" />
}
