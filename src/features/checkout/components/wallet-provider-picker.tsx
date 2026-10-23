import { Loader2, PlugZap } from 'lucide-react'
import {
  networkLabels,
  walletTypeLabels,
  type Wallet,
  type WalletConnection,
  type WalletType,
} from '@/api/contracts'
import { shortenHash } from '@/lib/format'
import { cn } from '@/lib/utils'

type WalletProviderPickerProps = {
  value: WalletType
  onChange: (value: WalletType) => void
  connection: WalletConnection | null
  connectedWallet: Wallet | null
  onDisconnect: () => void
  connecting: boolean
  className?: string
}

const providerMarks: Record<WalletType, string> = {
  walletconnect: 'W',
  metamask: 'M',
  coinbase: 'C',
}

const providerOrder: WalletType[] = ['walletconnect', 'metamask', 'coinbase']

export function WalletProviderPicker({
  value,
  onChange,
  connection,
  connectedWallet,
  onDisconnect,
  connecting,
  className,
}: WalletProviderPickerProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <fieldset className="flex min-w-0 flex-col gap-4">
        <legend className="mb-4 text-[17px] leading-4 font-bold text-foreground lg:text-center">
          Carteira e rede
        </legend>
        {providerOrder.map((type) => {
          const checked = value === type
          return (
            <label
              key={type}
              className={cn(
                'flex h-16 cursor-pointer items-center gap-4 rounded-[14px] border bg-surface-card px-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring lg:h-[45px] lg:rounded-[3px] lg:bg-transparent',
                checked
                  ? 'border-primary'
                  : 'border-transparent lg:border-border hover:border-border-soft',
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-[#2f1d15] text-body font-bold text-text-accent lg:hidden"
              >
                {providerMarks[type]}
              </span>
              <input
                type="radio"
                name="wallet-provider"
                checked={checked}
                onChange={() => onChange(type)}
                className="order-last ml-auto size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-primary/70 checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--surface-card)] lg:order-first lg:ml-0 lg:size-[15px] lg:checked:shadow-[inset_0_0_0_2px_var(--ink)]"
              />
              <span className="text-[15px] text-foreground">{walletTypeLabels[type]}</span>
            </label>
          )
        })}
      </fieldset>
      <output
        aria-live="polite"
        className="flex min-h-10 items-center gap-3 rounded-[3px] bg-surface-card px-4 py-2 text-caption text-text-secondary"
      >
        {connecting ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin text-text-accent" />
            Aguardando aprovação na carteira…
          </>
        ) : connection && connection.status === 'connected' ? (
          <>
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
            <span className="min-w-0 flex-1">
              Conectada: {connectedWallet?.nickname ?? 'carteira'} ·{' '}
              {shortenHash(connection.address)} · {networkLabels[connection.network]}
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="shrink-0 font-bold text-text-accent hover:underline"
            >
              Desconectar
            </button>
          </>
        ) : (
          <>
            <PlugZap aria-hidden="true" className="size-4 shrink-0 text-text-accent" />
            Nenhuma carteira conectada. A conexão é solicitada ao confirmar a compra.
          </>
        )}
      </output>
    </div>
  )
}
