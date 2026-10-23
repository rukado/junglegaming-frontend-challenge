import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { authSearchSchema } from '@/features/auth/auth-search'
import { AuthNotice } from '@/features/auth/components/auth-notice'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { LoginForm } from '@/features/auth/components/login-form'
import { loadSession, safeRedirect } from '@/features/auth/session'

export const Route = createFileRoute('/login')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await loadSession(context.queryClient).catch(() => null)
    if (session) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Entrar · Kurio' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: target, reason } = Route.useSearch()
  return (
    <AuthShell
      mode="login"
      redirect={target}
      description="Entre para gerenciar sua carteira, coleção e perfil de criador."
      notice={<AuthNotice reason={reason} />}
      footer={
        <>
          Novo na Kurio?{' '}
          <Link
            to="/register"
            search={{ redirect: target }}
            replace
            className="font-bold text-text-accent underline-offset-4 hover:underline"
          >
            Crie uma conta
          </Link>
        </>
      }
    >
      <LoginForm redirect={target} />
    </AuthShell>
  )
}
