import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { AddCartItemRequest, Cart, NetworkId } from '@/api/contracts'
import { cartApi } from '@/api/endpoints/cart'
import { quoteApi } from '@/api/endpoints/quote'
import { queryKeys, type Viewer } from '@/app/query-keys'
import { useSession } from '@/features/auth/session'
import { getGuestCartId } from './guest-cart'

const cartMutationScope = { id: 'cart' }

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

export function quoteQueryOptions(viewer: Viewer, cartVersion: number, network: NetworkId) {
  return queryOptions({
    queryKey: queryKeys.cart.quote(viewer, cartVersion, network),
    queryFn: ({ signal }) => quoteApi.create({ network }, signal),
    staleTime: 30_000,
  })
}

export function useQuote(viewer: Viewer | null, cart: Cart | undefined, network: NetworkId) {
  const ready = viewer !== null && cart !== undefined && cart.items.length > 0
  return useQuery({
    ...quoteQueryOptions(
      viewer ?? { kind: 'guest', cartId: 'pending' },
      cart?.version ?? 0,
      network,
    ),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

function useCartWriter() {
  const queryClient = useQueryClient()
  const viewer = useViewer()
  const key = viewer ? queryKeys.cart.owner(viewer) : null
  return {
    queryClient,
    key,
    write(cart: Cart) {
      if (!key) return
      const current = queryClient.getQueryData<Cart>(key)
      if (current && current.version > cart.version) return
      queryClient.setQueryData(key, cart)
    },
    settle() {
      return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all, exact: false })
    },
  }
}

export function useAddToCart() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: (body: AddCartItemRequest) => cartApi.addItem(body),
    scope: cartMutationScope,
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}

export function useUpdateCartItem() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    scope: cartMutationScope,
    onMutate: async ({ itemId, quantity }) => {
      if (!cart.key) return undefined
      await cart.queryClient.cancelQueries({ queryKey: cart.key, exact: true })
      const previous = cart.queryClient.getQueryData<Cart>(cart.key)
      if (previous) {
        cart.queryClient.setQueryData<Cart>(cart.key, {
          ...previous,
          items: previous.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (cart.key && context?.previous) cart.queryClient.setQueryData(cart.key, context.previous)
    },
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}

export function useRemoveCartItem() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    scope: cartMutationScope,
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}

export function useApplyCoupon() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon({ code }),
    scope: cartMutationScope,
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}

export function useRemoveCoupon() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    scope: cartMutationScope,
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}

export function useAcceptCartChanges() {
  const cart = useCartWriter()
  return useMutation({
    mutationFn: () => cartApi.acceptChanges(),
    scope: cartMutationScope,
    onSuccess: cart.write,
    onSettled: cart.settle,
  })
}
