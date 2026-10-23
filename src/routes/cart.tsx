import { createFileRoute } from '@tanstack/react-router'
import { CartView } from '@/features/cart/components/cart-view'

export const Route = createFileRoute('/cart')({
  staticData: { mobileChrome: 'minimal' },
  head: () => ({ meta: [{ title: 'Carrinho · Kurio' }] }),
  component: CartView,
})
