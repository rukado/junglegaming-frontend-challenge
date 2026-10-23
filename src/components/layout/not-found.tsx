import { Link } from '@tanstack/react-router'
import { PageShell } from './page-shell'

export function NotFound() {
  return (
    <PageShell
      title="Página não encontrada"
      description="O endereço acessado não existe ou foi removido."
    >
      <Link
        to="/"
        className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-body-lg font-bold text-ink hover:bg-text-accent"
      >
        Voltar ao início
      </Link>
    </PageShell>
  )
}
