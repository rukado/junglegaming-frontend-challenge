import { createFileRoute } from '@tanstack/react-router'
import { errorMessage } from '@/api/errors'
import { StatusMessage } from '@/components/common/status-message'
import { AccountLayout } from '@/features/account/components/account-layout'
import { requireSession } from '@/features/auth/guards'
import { WalletSection } from '@/features/wallets/components/wallet-section'
import { useWallets } from '@/features/wallets/queries'

export const Route = createFileRoute('/wallets')({
  beforeLoad: requireSession,
  head: () => ({ meta: [{ title: 'Carteiras · Kurio' }] }),
  component: WalletsPage,
})

function WalletsPage() {
  const wallets = useWallets()
  const items = wallets.data?.items ?? []
  const primary = items.find((wallet) => wallet.slot === 'primary')
  const secondary = items.find((wallet) => wallet.slot === 'secondary')

  return (
    <AccountLayout>
      <h1 className="sr-only">Carteiras</h1>
      {wallets.isError ? (
        <StatusMessage
          tone="error"
          title="Não foi possível carregar suas carteiras"
          description={errorMessage(wallets.error)}
          action={
            <button
              type="button"
              onClick={() => void wallets.refetch()}
              className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
            >
              Tentar novamente
            </button>
          }
        />
      ) : !wallets.data ? (
        <div aria-busy="true" aria-label="Carregando carteiras" className="flex flex-col gap-4">
          <div className="skeleton-shimmer h-6 w-48 rounded-sm" />
          <div className="skeleton-shimmer h-80 rounded-sm" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <WalletSection slot="primary" wallet={primary} />
          <WalletSection slot="secondary" wallet={secondary} primary={primary} />
        </div>
      )}
    </AccountLayout>
  )
}
