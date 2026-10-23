import { queryOptions } from '@tanstack/react-query'
import { ordersApi } from '@/api/endpoints/orders'
import { queryKeys } from '@/app/query-keys'

export const orderPollingMs = 1_500

export function orderQueryOptions(userId: string, orderId: string) {
  return queryOptions({
    queryKey: queryKeys.user.order(userId, orderId),
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? orderPollingMs : false),
  })
}

export function activeOrdersQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.activeOrders(userId),
    queryFn: ({ signal }) => ordersApi.active(signal),
    refetchInterval: (query) =>
      (query.state.data?.items.length ?? 0) > 0 ? orderPollingMs * 2 : false,
  })
}
