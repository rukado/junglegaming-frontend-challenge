import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'
import { requireSession } from '@/features/auth/guards'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireSession,
  component: OrderPage,
})

function OrderPage() {
  const { orderId } = Route.useParams()
  return <PageShell title="Confirmação de pedido" description={orderId} />
}
