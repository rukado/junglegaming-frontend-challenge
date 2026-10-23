import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return <PageShell title="Entrar" />
}
