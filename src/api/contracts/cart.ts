import { z } from 'zod'
import { ethAmount, isoDate } from './common'
import { editionKind, nftImage } from './nft'

export const cartItem = z.object({
  id: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  editionKind: editionKind,
  name: z.string(),
  tokenId: z.string(),
  image: nftImage,
  quantity: z.number().int().min(1),
  unitPriceEth: ethAmount,
  available: z.number().int().min(0),
  maxPerOrder: z.number().int().min(1),
})
export type CartItem = z.infer<typeof cartItem>

export const cart = z.object({
  id: z.string(),
  ownerType: z.enum(['guest', 'user']),
  items: z.array(cartItem),
  couponCode: z.string().nullable(),
  updatedAt: isoDate,
  version: z.number().int().min(1),
})
export type Cart = z.infer<typeof cart>

export const addCartItemRequest = z.object({
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().min(1),
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequest>

export const updateCartItemRequest = z.object({
  quantity: z.number().int().min(1),
})
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequest>

export const applyCouponRequest = z.object({
  code: z.string().trim().min(1, 'Informe o código').max(32, 'Código muito longo'),
})
export type ApplyCouponRequest = z.infer<typeof applyCouponRequest>

export const mergeCartRequest = z.object({
  guestCartId: z.string(),
})
export type MergeCartRequest = z.infer<typeof mergeCartRequest>
