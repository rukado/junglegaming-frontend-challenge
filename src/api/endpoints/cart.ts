import {
  cart,
  type AddCartItemRequest,
  type ApplyCouponRequest,
  type MergeCartRequest,
  type UpdateCartItemRequest,
} from '../contracts'
import { request } from '../http'

export const cartApi = {
  get: (signal?: AbortSignal) => request(cart, { method: 'GET', url: '/cart', signal }),
  addItem: (body: AddCartItemRequest) =>
    request(cart, { method: 'POST', url: '/cart/items', data: body }),
  updateItem: (itemId: string, body: UpdateCartItemRequest) =>
    request(cart, {
      method: 'PATCH',
      url: `/cart/items/${encodeURIComponent(itemId)}`,
      data: body,
    }),
  removeItem: (itemId: string) =>
    request(cart, { method: 'DELETE', url: `/cart/items/${encodeURIComponent(itemId)}` }),
  applyCoupon: (body: ApplyCouponRequest) =>
    request(cart, { method: 'PUT', url: '/cart/coupon', data: body }),
  removeCoupon: () => request(cart, { method: 'DELETE', url: '/cart/coupon' }),
  merge: (body: MergeCartRequest) =>
    request(cart, { method: 'POST', url: '/cart/merge', data: body }),
}
