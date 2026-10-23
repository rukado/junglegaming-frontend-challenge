import { Link } from '@tanstack/react-router'
import { networkLabels, type Wallet } from '@/api/contracts'
import { shortenHash } from '@/lib/format'
import { cn } from '@/lib/utils'

type SavedWalletsProps = {
  wallets: Wallet[]
  selectedId: string
  onSelect: (wallet: Wallet) => void
  className?: string
}

export function SavedWallets({ wallets, selectedId, onSelect, className }: SavedWalletsProps) {
  if (wallets.length === 0) return null
  return (
    <fieldset className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-4">
        <legend className="float-left text-[17px] leading-4 font-bold text-foreground">
          Carteira salva
        </legend>
        <Link to="/wallets" className="text-body font-bold text-text-accent hover:underline">
          Trocar carteira
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {wallets.map((wallet) => {
          const checked = wallet.id === selectedId
          const ens = wallet.ens.label ? `${wallet.ens.label}${wallet.ens.suffix}` : null
          return (
            <label
              aria-label={wallet.nickname}
              key={wallet.id}
              className={cn(
                'relative flex cursor-pointer items-start gap-4 rounded-[14px] border bg-surface-card px-5 py-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring md:rounded-[3px]',
                checked
                  ? 'border-primary'
                  : 'border-transparent md:border-border hover:border-border-soft',
              )}
            >
              <input
                type="radio"
                name="saved-wallet"
                checked={checked}
                onChange={() => onSelect(wallet)}
                className="mt-1 size-[15px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-primary/70 checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--surface-card)]"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-body-lg font-bold text-foreground">{wallet.nickname}</span>
                <span className="truncate text-body text-text-secondary">
                  {ens ?? shortenHash(wallet.address)}
                </span>
                <span className="text-body text-text-secondary">
                  Rede {networkLabels[wallet.network]}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
