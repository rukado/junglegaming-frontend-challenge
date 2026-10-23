import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, X, XCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { networkLabels } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { queryKeys } from '@/app/query-keys'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { orderQueryOptions } from '../queries'
import { OrderReceipt } from './order-receipt'

type OrderDialogProps = {
  userId: string
  orderId: string
}

export function OrderDialog({ userId, orderId }: OrderDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: order, error, isError, refetch } = useQuery(orderQueryOptions(userId, orderId))
  const status = order?.status
  const settledRef = useRef<string | null>(null)

  useEffect(() => {
    if (!status || status === 'pending' || settledRef.current === status) return
    settledRef.current = status
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.user.activeOrders(userId) })
  }, [status, queryClient, userId])

  const close = () => void navigate({ to: '/' })

  let title: string
  let description: string
  let body
  if (isError && !order) {
    title = 'Pedido indisponível'
    description = errorMessage(error)
    body = (
      <div className="flex flex-col items-center gap-4 px-6 pb-10 text-center">
        <XCircle aria-hidden="true" className="size-12 text-destructive" />
        <p className="text-body text-text-secondary">{description}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
        >
          Tentar novamente
        </button>
      </div>
    )
  } else if (!order || order.status === 'pending') {
    title = 'Processando pagamento'
    description = order
      ? `Aguardando a confirmação da rede ${networkLabels[order.network]}. Você pode fechar esta janela: o pedido continua sendo processado.`
      : 'Carregando o pedido…'
    body = (
      <output className="flex flex-col items-center gap-4 px-6 pb-12 text-center">
        <Loader2 aria-hidden="true" className="size-12 animate-spin text-text-accent" />
        <span className="text-lead font-bold text-foreground">{title}</span>
        <span className="max-w-[380px] text-body text-text-secondary">{description}</span>
      </output>
    )
  } else if (order.status === 'rejected') {
    title = 'Pagamento recusado'
    description = order.rejectionReason ?? 'A carteira recusou o pagamento.'
    body = (
      <div role="alert" className="flex flex-col items-center gap-4 px-6 pb-12 text-center">
        <XCircle aria-hidden="true" className="size-12 text-destructive" />
        <span className="text-lead font-bold text-foreground">{title}</span>
        <span className="max-w-[380px] text-body text-text-secondary">
          {description} Nenhum valor foi cobrado e os itens continuam no seu carrinho.
        </span>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/checkout"
            className="rounded-md bg-primary px-5 py-2 text-body font-bold text-ink hover:bg-text-accent"
          >
            Tentar novamente
          </Link>
          <Link
            to="/cart"
            className="rounded-md border border-primary px-5 py-2 text-body font-bold text-text-accent hover:bg-surface-dark"
          >
            Voltar ao carrinho
          </Link>
        </div>
      </div>
    )
  } else {
    title = 'Compra confirmada'
    description = 'Seus NFTs agora estão na sua carteira.'
    body = <OrderReceipt order={order} />
  }

  const confirmed = order?.status === 'confirmed'

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 bg-ink p-0 pt-16 ring-0 sm:max-w-none',
          'md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[calc(100dvh-2rem)] md:w-[578px] md:-translate-x-1/2 md:-translate-y-1/2 md:bg-surface-card md:pt-6',
        )}
      >
        <DialogClose
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-sm text-text-accent hover:bg-surface-dark"
          aria-label="Fechar"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </DialogClose>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className={cn(!confirmed && 'pt-10')}>{body}</div>
        <span
          aria-hidden="true"
          className="mt-auto hidden h-2.5 w-full shrink-0 bg-primary md:block"
        />
      </DialogContent>
    </Dialog>
  )
}
