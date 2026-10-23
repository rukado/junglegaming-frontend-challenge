import { z } from 'zod'
import { ethAmount, evmAddress, isoDate, networkId, walletType } from './common'
import { editionKind, nftImage } from './nft'
import { walletFields } from './wallet'

export const orderStatuses = ['pending', 'confirmed', 'rejected'] as const
export const orderStatus = z.enum(orderStatuses)
export type OrderStatus = z.infer<typeof orderStatus>

export const orderLine = z.object({
  itemId: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  editionKind: editionKind,
  name: z.string(),
  tokenId: z.string(),
  image: nftImage,
  quantity: z.number().int().min(1),
  unitPriceEth: ethAmount,
  lineTotalEth: ethAmount,
})
export type OrderLine = z.infer<typeof orderLine>

export const collectorDetails = walletFields
  .pick({
    displayName: true,
    network: true,
    profileName: true,
    address: true,
    secondaryAddress: true,
    type: true,
    referralCode: true,
    email: true,
    ens: true,
  })
  .extend({
    username: z.string(),
    note: z.string().max(280, 'Use no máximo 280 caracteres'),
  })
export type CollectorDetails = z.infer<typeof collectorDetails>

export const order = z.object({
  id: z.string(),
  status: orderStatus,
  lines: z.array(orderLine),
  subtotalEth: ethAmount,
  discountEth: ethAmount,
  networkFeeEth: ethAmount,
  totalEth: ethAmount,
  couponCode: z.string().nullable(),
  network: networkId,
  wallet: z.object({ id: z.string(), type: walletType, label: z.string(), address: evmAddress }),
  txHash: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: isoDate,
  settledAt: isoDate.nullable(),
  version: z.number().int().min(1),
})
export type Order = z.infer<typeof order>

export const createOrderRequest = z.object({
  quoteId: z.string(),
  walletConnectionId: z.string(),
  expectedTotalEth: ethAmount,
  lines: z.array(
    z.object({
      itemId: z.string(),
      editionId: z.string(),
      quantity: z.number().int().min(1),
      unitPriceEth: ethAmount,
    }),
  ),
  collector: collectorDetails,
})
export type CreateOrderRequest = z.infer<typeof createOrderRequest>

export const activeOrdersResponse = z.object({ items: z.array(order) })
