import { Big } from 'big.js'
import { http, HttpResponse } from 'msw'
import {
  addCartItemRequest,
  applyCouponRequest,
  mergeCartRequest,
  quoteRequest,
  updateCartItemRequest,
} from '@/api/contracts'
import { apiPath } from '../config'
import { getDb } from '../db/store'
import { authenticate, bearerToken } from '../domain/auth'
import { updateEdition } from '../domain/catalog'
import {
  acceptChanges,
  buildLine,
  checkQuantity,
  findCart,
  getOrCreateCart,
  mergeCarts,
  ownerKey,
  resolveOwner,
  saveCart,
  toCartResponse,
  type CartOwner,
} from '../domain/cart'
import { issueQuote, toQuoteResponse } from '../domain/quote'
import { apiError, readJson, withNetwork } from '../network'
import { publishNftUpdated } from '../realtime/server'
import { getRuntime, getScenario } from '../scenarios'
import { validationError } from './validation'

type OwnerResult = { ok: true; owner: CartOwner } | { ok: false; response: Response }

function owner(request: Request): OwnerResult {
  if (bearerToken(request)) {
    const auth = authenticate(request)
    if (!auth.ok) return auth
    return { ok: true, owner: { type: 'user', id: auth.user.id } }
  }
  const resolved = resolveOwner(request, null)
  if (!resolved)
    return {
      ok: false,
      response: apiError(400, 'VALIDATION_ERROR', 'Identificador do carrinho ausente.'),
    }
  return { ok: true, owner: resolved }
}

function limitError(available: number, maxPerOrder: number) {
  const limit = Math.min(available, maxPerOrder)
  return apiError(
    409,
    'AVAILABILITY_CONFLICT',
    available === 0
      ? 'Esta edição está esgotada.'
      : `Quantidade indisponível. Você pode levar no máximo ${limit} ${limit === 1 ? 'unidade' : 'unidades'} desta edição.`,
    { details: { available, maxPerOrder } },
  )
}

export const cartHandlers = [
  http.get(
    apiPath('/cart'),
    withNetwork('cart:read', ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      return HttpResponse.json(toCartResponse(getOrCreateCart(result.owner)))
    }),
  ),
  http.post(
    apiPath('/cart/items'),
    withNetwork('cart:write', async ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const parsed = addCartItemRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const { nftId, editionId, quantity } = parsed.data
      const cart = getOrCreateCart(result.owner)
      const existing = cart.items.find((item) => item.editionId === editionId)
      const desired = (existing?.quantity ?? 0) + quantity
      const check = checkQuantity(nftId, editionId, desired)
      if (!check.ok) {
        return check.reason === 'not_found'
          ? apiError(404, 'NOT_FOUND', 'Edição não encontrada.')
          : limitError(check.available, check.maxPerOrder)
      }
      const line = buildLine(nftId, editionId, desired)
      if (!line) return apiError(404, 'NOT_FOUND', 'Edição não encontrada.')
      const updated = saveCart(cart.id, (draft) => {
        draft.items = existing
          ? draft.items.map((item) =>
              item.editionId === editionId ? { ...item, quantity: desired } : item,
            )
          : [...draft.items, line]
      })
      return HttpResponse.json(toCartResponse(updated), { status: existing ? 200 : 201 })
    }),
  ),
  http.patch(
    apiPath('/cart/items/:itemId'),
    withNetwork('cart:write', async ({ request, params }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const parsed = updateCartItemRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const cart = getOrCreateCart(result.owner)
      const item = cart.items.find((candidate) => candidate.id === params.itemId)
      if (!item) return apiError(404, 'NOT_FOUND', 'Item não encontrado no carrinho.')
      const check = checkQuantity(item.nftId, item.editionId, parsed.data.quantity)
      if (!check.ok) {
        return check.reason === 'not_found'
          ? apiError(404, 'NOT_FOUND', 'Edição não encontrada.')
          : limitError(check.available, check.maxPerOrder)
      }
      const updated = saveCart(cart.id, (draft) => {
        draft.items = draft.items.map((candidate) =>
          candidate.id === item.id ? { ...candidate, quantity: parsed.data.quantity } : candidate,
        )
      })
      return HttpResponse.json(toCartResponse(updated))
    }),
  ),
  http.delete(
    apiPath('/cart/items/:itemId'),
    withNetwork('cart:write', ({ request, params }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const cart = getOrCreateCart(result.owner)
      if (!cart.items.some((item) => item.id === params.itemId)) {
        return apiError(404, 'NOT_FOUND', 'Item não encontrado no carrinho.')
      }
      const updated = saveCart(cart.id, (draft) => {
        draft.items = draft.items.filter((item) => item.id !== params.itemId)
        if (draft.items.length === 0) draft.couponCode = null
      })
      return HttpResponse.json(toCartResponse(updated))
    }),
  ),
  http.put(
    apiPath('/cart/coupon'),
    withNetwork('cart:write', async ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const parsed = applyCouponRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const code = parsed.data.code.toUpperCase()
      const coupon = getDb().coupons.find((candidate) => candidate.code === code)
      if (!coupon) {
        return apiError(
          422,
          'COUPON_INVALID',
          'Cupom inválido. Confira o código e tente novamente.',
          {
            fieldErrors: { code: 'Cupom inválido.' },
          },
        )
      }
      if (coupon.expiresAt !== null && coupon.expiresAt <= Date.now()) {
        return apiError(422, 'COUPON_EXPIRED', 'Este cupom expirou.', {
          fieldErrors: { code: 'Cupom expirado.' },
        })
      }
      const cart = getOrCreateCart(result.owner)
      if (cart.items.length === 0) {
        return apiError(
          422,
          'VALIDATION_ERROR',
          'Adicione itens ao carrinho antes de aplicar um cupom.',
          {
            fieldErrors: { code: 'Carrinho vazio.' },
          },
        )
      }
      const updated = saveCart(cart.id, (draft) => {
        draft.couponCode = code
      })
      return HttpResponse.json(toCartResponse(updated))
    }),
  ),
  http.delete(
    apiPath('/cart/coupon'),
    withNetwork('cart:write', ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const cart = getOrCreateCart(result.owner)
      const updated = saveCart(cart.id, (draft) => {
        draft.couponCode = null
      })
      return HttpResponse.json(toCartResponse(updated))
    }),
  ),
  http.post(
    apiPath('/cart/accept-changes'),
    withNetwork('cart:write', ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      return HttpResponse.json(toCartResponse(acceptChanges(getOrCreateCart(result.owner))))
    }),
  ),
  http.post(
    apiPath('/cart/merge'),
    withNetwork('cart:write', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = mergeCartRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const target = getOrCreateCart({ type: 'user', id: auth.user.id })
      const guest = findCart({ type: 'guest', id: parsed.data.guestCartId })
      if (!guest || guest.items.length === 0) return HttpResponse.json(toCartResponse(target))
      return HttpResponse.json(toCartResponse(mergeCarts(guest, target)))
    }),
  ),
  http.post(
    apiPath('/quotes'),
    withNetwork('quotes:create', async ({ request }) => {
      const result = owner(request)
      if (!result.ok) return result.response
      const parsed = quoteRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const cart = getOrCreateCart(result.owner)
      const quote = issueQuote(cart, parsed.data.network, ownerKey(result.owner))
      const runtime = getRuntime()
      const first = cart.items[0]
      if (
        getScenario().priceChangeAfterQuote &&
        !runtime.priceChangeFired &&
        first &&
        result.owner.type === 'user'
      ) {
        runtime.priceChangeFired = true
        setTimeout(() => {
          const nftEdition = getDb()
            .nfts.find((nft) => nft.id === first.nftId)
            ?.editions.find((edition) => edition.id === first.editionId)
          if (!nftEdition) return
          const bumped = new Big(nftEdition.priceEth).plus('0.1').toFixed(2)
          const updated = updateEdition(first.nftId, first.editionId, { priceEth: bumped })
          if (updated) publishNftUpdated(updated)
        }, 1_500)
      }
      return HttpResponse.json(toQuoteResponse(quote))
    }),
  ),
]
