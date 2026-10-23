import { AlertTriangle, Loader2 } from 'lucide-react'
import { networkLabels, walletTypeLabels, type QuoteLine } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatEthAmount, shortenHash } from '@/lib/format'
import type { CheckoutReview, SubmitState } from '../use-checkout'

type ReviewDialogProps = {
  review: CheckoutReview | null
  submit: SubmitState
  names: Map<string, string>
  onConfirm: () => void
  onAcceptChanges: () => void
  accepting: boolean
  onClose: () => void
}

function lineChange(line: QuoteLine) {
  if (line.status === 'sold_out') return 'esgotado'
  if (line.status === 'insufficient') return `restam ${line.available}`
  return `de ${formatEthAmount(line.previousUnitPriceEth ?? line.unitPriceEth)} para ${formatEthAmount(line.unitPriceEth)}`
}

export function ReviewDialog({
  review,
  submit,
  names,
  onConfirm,
  onAcceptChanges,
  accepting,
  onClose,
}: ReviewDialogProps) {
  const submitting = submit.status === 'submitting'
  const quote = review?.quote
  const blocked = quote ? !quote.purchasable : false

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={!submitting}
        onInteractOutside={(event) => submitting && event.preventDefault()}
        onEscapeKeyDown={(event) => submitting && event.preventDefault()}
        className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto rounded-none border-0 bg-surface-card p-6 sm:max-w-[520px]"
      >
        <DialogHeader>
          <DialogTitle className="text-heading font-bold text-foreground">
            Revise sua compra
          </DialogTitle>
          <DialogDescription className="text-body text-text-secondary">
            Confira os valores antes de assinar. A cotação vale por alguns minutos.
          </DialogDescription>
        </DialogHeader>

        {review && quote && (
          <>
            {review.changed && (
              <p
                role="alert"
                className="flex gap-2 rounded-md border border-primary/60 bg-surface-dark/60 p-3 text-caption text-foreground"
              >
                <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-text-accent" />
                Os valores mudaram desde a última visualização. Confira o novo total antes de
                confirmar.
              </p>
            )}

            <ul className="flex flex-col gap-2 border-b border-primary/30 pb-4">
              {quote.lines.map((line) => (
                <li
                  key={line.itemId}
                  className="flex items-baseline justify-between gap-3 text-body"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {names.get(line.itemId) ?? line.nftId}{' '}
                    <span className="text-text-secondary">(x {line.quantity})</span>
                  </span>
                  <span className="shrink-0 font-bold text-text-accent">
                    {formatEthAmount(line.lineTotalEth)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="text-right text-foreground">{formatEthAmount(quote.subtotalEth)}</dd>
              <dt className="text-text-secondary">Desconto</dt>
              <dd className="text-right text-foreground">
                (-) {formatEthAmount(quote.discountEth)}
              </dd>
              <dt className="text-text-secondary">Taxa de rede</dt>
              <dd className="text-right text-foreground">
                {formatEthAmount(quote.networkFeeEth, 3)}
              </dd>
              <dt className="font-bold text-foreground">Total</dt>
              <dd className="text-right text-lead font-bold text-text-accent">
                {formatEthAmount(quote.totalEth, 3)}
              </dd>
              <dt className="mt-3 text-text-secondary">Carteira</dt>
              <dd className="mt-3 text-right text-foreground">
                {walletTypeLabels[review.values.type]} · {review.wallet.nickname} ·{' '}
                {shortenHash(review.connection.address)}
              </dd>
              <dt className="text-text-secondary">Rede</dt>
              <dd className="text-right text-foreground">{networkLabels[quote.network]}</dd>
              <dt className="text-text-secondary">Colecionador</dt>
              <dd className="truncate text-right text-foreground">
                {review.values.displayName} · {review.values.email}
              </dd>
            </dl>

            {blocked && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-md border border-destructive/60 bg-destructive/10 p-3"
              >
                <p className="text-caption text-foreground">
                  Alguns itens mudaram de preço ou disponibilidade desde que entraram no carrinho:
                </p>
                <ul className="flex flex-col gap-1 text-caption text-text-secondary">
                  {quote.lines
                    .filter((line) => line.status !== 'ok')
                    .map((line) => (
                      <li key={line.itemId}>
                        {names.get(line.itemId) ?? line.nftId}: {lineChange(line)}
                      </li>
                    ))}
                </ul>
                <ActionButton
                  variant="outline"
                  onClick={onAcceptChanges}
                  pending={accepting}
                  pendingLabel="Atualizando…"
                  className="self-start"
                >
                  Aceitar novos valores
                </ActionButton>
              </div>
            )}
            {submit.status === 'uncertain' && (
              <p role="alert" className="text-caption text-text-accent">
                {submit.message}
              </p>
            )}
            {submit.status === 'error' && (
              <p role="alert" className="text-caption text-destructive">
                {submit.message}
              </p>
            )}
            {submitting && (
              <output className="flex items-center gap-2 text-caption text-text-secondary">
                <Loader2 aria-hidden="true" className="size-4 animate-spin text-text-accent" />
                Enviando pedido e aguardando a assinatura da carteira…
              </output>
            )}
          </>
        )}

        <DialogFooter className="mx-0 mb-0 flex-row gap-3 rounded-none border-0 bg-transparent p-0 sm:justify-end">
          <ActionButton variant="outline" onClick={onClose} disabled={submitting}>
            Voltar
          </ActionButton>
          <ActionButton
            onClick={onConfirm}
            disabled={blocked}
            pending={submitting}
            pendingLabel="Confirmando…"
            className="flex-1 sm:flex-none"
          >
            {submit.status === 'uncertain' ? 'Tentar novamente' : 'Confirmar e assinar'}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
