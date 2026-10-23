import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '@/components/layout/page-shell'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return <PageShell title="Pagamento" />
}
