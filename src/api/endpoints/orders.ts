import { activeOrdersResponse, order, type CreateOrderRequest } from '../contracts'
import { request } from '../http'

export const ordersApi = {
  create: (body: CreateOrderRequest, idempotencyKey: string) =>
    request(order, {
      method: 'POST',
      url: '/orders',
      data: body,
      headers: { 'Idempotency-Key': idempotencyKey },
      timeout: 8_000,
    }),
  get: (orderId: string, signal?: AbortSignal) =>
    request(order, { method: 'GET', url: `/orders/${encodeURIComponent(orderId)}`, signal }),
  active: (signal?: AbortSignal) =>
    request(activeOrdersResponse, {
      method: 'GET',
      url: '/orders',
      params: { status: 'pending' },
      signal,
    }),
}
