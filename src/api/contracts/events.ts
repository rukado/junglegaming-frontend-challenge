import { z } from 'zod'
import { ethAmount, isoDate } from './common'
import { orderStatus } from './order'

export const nftUpdatedEvent = z.object({
  id: z.string(),
  type: z.literal('nft.updated'),
  resource: z.object({ type: z.literal('nft'), id: z.string() }),
  version: z.number().int().min(1),
  occurredAt: isoDate,
  data: z.object({
    priceEth: ethAmount,
    available: z.number().int().min(0),
    editions: z.array(
      z.object({ id: z.string(), priceEth: ethAmount, available: z.number().int().min(0) }),
    ),
  }),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEvent>

export const orderUpdatedEvent = z.object({
  id: z.string(),
  type: z.literal('order.updated'),
  resource: z.object({ type: z.literal('order'), id: z.string() }),
  userId: z.string(),
  version: z.number().int().min(1),
  occurredAt: isoDate,
  data: z.object({
    status: orderStatus,
    txHash: z.string().nullable(),
    explorerUrl: z.string().nullable(),
    rejectionReason: z.string().nullable(),
    settledAt: isoDate.nullable(),
  }),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEvent>

export const realtimeEvent = z.discriminatedUnion('type', [nftUpdatedEvent, orderUpdatedEvent])
export type RealtimeEvent = z.infer<typeof realtimeEvent>

export const realtimeEventNames = {
  nftUpdated: 'nft.updated',
  orderUpdated: 'order.updated',
} as const
