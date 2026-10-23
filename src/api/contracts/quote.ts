import { z } from 'zod'
import { ethAmount, isoDate, networkId } from './common'

export const quoteLineStatus = z.enum(['ok', 'price_changed', 'insufficient', 'sold_out'])
export type QuoteLineStatus = z.infer<typeof quoteLineStatus>

export const quoteLine = z.object({
  itemId: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  quantity: z.number().int().min(1),
  unitPriceEth: ethAmount,
  previousUnitPriceEth: ethAmount.nullable(),
  lineTotalEth: ethAmount,
  available: z.number().int().min(0),
  status: quoteLineStatus,
})
export type QuoteLine = z.infer<typeof quoteLine>

export const quoteCoupon = z.object({
  code: z.string(),
  status: z.enum(['applied', 'invalid', 'expired']),
  discountPercent: z.number().min(0).max(100),
  label: z.string(),
})
export type QuoteCoupon = z.infer<typeof quoteCoupon>

export const quote = z.object({
  id: z.string(),
  cartVersion: z.number().int().min(1),
  network: networkId,
  lines: z.array(quoteLine),
  subtotalEth: ethAmount,
  discountEth: ethAmount,
  networkFeeEth: ethAmount,
  totalEth: ethAmount,
  coupon: quoteCoupon.nullable(),
  purchasable: z.boolean(),
  issuedAt: isoDate,
  expiresAt: isoDate,
})
export type Quote = z.infer<typeof quote>

export const quoteRequest = z.object({
  network: networkId,
})
export type QuoteRequest = z.infer<typeof quoteRequest>
