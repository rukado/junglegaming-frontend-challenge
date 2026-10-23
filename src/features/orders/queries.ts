import { queryOptions } from '@tanstack/react-query'
import { ordersApi } from '@/api/endpoints/orders'
import { queryKeys } from '@/app/query-keys'
import { realtimeStatusStore } from '@/realtime/status'

export const orderPollingMs = 1_500
const connectedPollingMs = 10_000

function pollingInterval() {
  return realtimeStatusStore.get() === 'connected' ? connectedPollingMs : orderPollingMs
}

export function orderQueryOptions(userId: string, orderId: string) {
  return queryOptions({
    queryKey: queryKeys.user.order(userId, orderId),
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? pollingInterval() : false,
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
