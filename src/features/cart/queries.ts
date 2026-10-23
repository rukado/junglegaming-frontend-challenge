import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AddCartItemRequest, Cart } from '@/api/contracts'
import { cartApi } from '@/api/endpoints/cart'
import { queryKeys, type Viewer } from '@/app/query-keys'
import { useSession } from '@/features/auth/session'
import { getGuestCartId } from './guest-cart'

export function useViewer(): Viewer | null {
  const session = useSession()
  if (session.status === 'loading') return null
  if (session.status === 'authenticated') return { kind: 'user', userId: session.user.id }
  return { kind: 'guest', cartId: getGuestCartId() }
}

export function cartQueryOptions(viewer: Viewer) {
  return queryOptions({
    queryKey: queryKeys.cart.owner(viewer),
    queryFn: ({ signal }) => cartApi.get(signal),
  })
}

export function useCart() {
  const viewer = useViewer()
  const query = useQuery({
    ...cartQueryOptions(viewer ?? { kind: 'guest', cartId: 'pending' }),
    enabled: viewer !== null,
  })
  return { viewer, query }
}

export function cartItemCount(cart: Cart | undefined) {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const viewer = useViewer()
  return useMutation({
    mutationFn: (body: AddCartItemRequest) => cartApi.addItem(body),
    onSuccess: (cart) => {
      if (viewer) queryClient.setQueryData(queryKeys.cart.owner(viewer), cart)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  })
}
