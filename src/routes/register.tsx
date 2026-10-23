import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return <PageShell title="Criar conta" />
}
