import { delay, http, HttpResponse } from 'msw'
import { createOrderRequest } from '@/api/contracts'
import { apiPath } from '../config'
import { getDb } from '../db/store'
import { authenticate } from '../domain/auth'
import { createOrder, ensureSettled, findUserOrder, toOrderResponse } from '../domain/orders'
import { apiError, readJson, withNetwork } from '../network'
import { getRuntime, getScenario } from '../scenarios'
import { validationError } from './validation'

const orderTimeoutDelayMs = 12_000

export const orderHandlers = [
  http.post(
    apiPath('/orders'),
    withNetwork('orders:create', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const key = request.headers.get('Idempotency-Key')
      if (!key || key.length < 8) {
        return apiError(400, 'VALIDATION_ERROR', 'Cabeçalho Idempotency-Key obrigatório.')
      }
      const parsed = createOrderRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const result = createOrder(auth.user, key, parsed.data)
      if (result.kind === 'error') return result.response
      const runtime = getRuntime()
      if (
        result.kind === 'created' &&
        getScenario().orderResponseTimeoutOnce &&
        !runtime.timeoutFired
      ) {
        runtime.timeoutFired = true
        await delay(orderTimeoutDelayMs)
      }
      return HttpResponse.json(toOrderResponse(result.order), {
        status: result.kind === 'created' ? 201 : 200,
      })
    }),
  ),
  http.get(
    apiPath('/orders'),
    withNetwork('orders:read', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const status = new URL(request.url).searchParams.get('status')
      const items = getDb()
        .orders.filter((order) => order.userId === auth.user.id)
        .map(ensureSettled)
        .filter((order) => !status || order.status === status)
        .map(toOrderResponse)
      return HttpResponse.json({ items })
    }),
  ),
  http.get(
    apiPath('/orders/:orderId'),
    withNetwork('orders:read', ({ request, params }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const orderId = String(params.orderId)
      const order = findUserOrder(auth.user, orderId)
      if (!order) {
        const exists = getDb().orders.some((candidate) => candidate.id === orderId)
        return exists
          ? apiError(403, 'FORBIDDEN', 'Você não tem permissão para ver este pedido.')
          : apiError(404, 'NOT_FOUND', 'Pedido não encontrado.')
      }
      return HttpResponse.json(toOrderResponse(ensureSettled(order)))
    }),
  ),
]
