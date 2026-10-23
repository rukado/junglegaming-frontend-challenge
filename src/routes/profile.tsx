import { createFileRoute } from '@tanstack/react-router'
import { AccountLayout } from '@/features/account/components/account-layout'
import { ProfileForm } from '@/features/account/components/profile-form'
import { requireSession } from '@/features/auth/guards'
import { useSession } from '@/features/auth/session'

export const Route = createFileRoute('/profile')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Meu perfil · Kurio' }] }),
  component: ProfilePage,
})

function ProfilePage() {
  const session = useSession()
  return (
    <AccountLayout>
      <h1 className="sr-only">Meu perfil</h1>
      {session.status === 'authenticated' ? (
        <ProfileForm key={session.user.id} user={session.user} />
      ) : (
        <div aria-busy="true" className="skeleton-shimmer h-96 rounded-sm" />
      )}
    </AccountLayout>
  )
}
