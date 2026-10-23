import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/features/auth/guards'
import { useCurrentUserId } from '@/features/auth/session'
import { OrderDialog } from '@/features/orders/components/order-dialog'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireSession,
  staticData: { mobileChrome: 'minimal' },
  head: () => ({ meta: [{ title: 'Pedido · Kurio' }] }),
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  const userId = useCurrentUserId()
  return (
    <div className="min-h-[60vh]">
      {userId && <OrderDialog userId={userId} orderId={orderId} />}
    </div>
  )
}
