import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { authSearchSchema } from '@/features/auth/auth-search'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { RegisterForm } from '@/features/auth/components/register-form'
import { loadSession, safeRedirect } from '@/features/auth/session'

export const Route = createFileRoute('/register')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await loadSession(context.queryClient).catch(() => null)
    if (session) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Criar conta · Kurio' }] }),
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect: target } = Route.useSearch()
  return (
    <AuthShell
      mode="register"
      redirect={target}
      description="Crie seu perfil de colecionador e conecte uma carteira quando quiser."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to="/login"
            search={{ redirect: target }}
            replace
            className="font-bold text-text-accent underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm redirect={target} />
    </AuthShell>
  )
}
