import { AlertTriangle } from 'lucide-react'
import type { Quote } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'

type CartChangesNoticeProps = {
  quote: Quote
  pending: boolean
  onAccept: () => void
}

export function CartChangesNotice({ quote, pending, onAccept }: CartChangesNoticeProps) {
  const changed = quote.lines.filter((line) => line.status !== 'ok')
  if (changed.length === 0) return null
  const soldOut = changed.filter((line) => line.status === 'sold_out').length
  const parts = [
    changed.some((line) => line.status === 'price_changed') && 'preços foram atualizados',
    changed.some((line) => line.status === 'insufficient') && 'há menos unidades disponíveis',
    soldOut > 0 && (soldOut === 1 ? 'um item esgotou' : `${soldOut} itens esgotaram`),
  ].filter(Boolean)

  return (
    <output className="flex flex-col gap-3 rounded-md border border-primary/60 bg-surface-dark/60 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-text-accent" />
        <div>
          <p className="text-body font-bold text-foreground">Seu carrinho mudou</p>
          <p className="text-caption text-text-secondary">
            Desde que você adicionou os itens, {parts.join(', ')}. Confirme para atualizar o
            carrinho com os valores atuais.
          </p>
        </div>
      </div>
      <ActionButton
        onClick={onAccept}
        pending={pending}
        pendingLabel="Atualizando…"
        className="shrink-0"
      >
        Atualizar carrinho
      </ActionButton>
    </output>
  )
}
