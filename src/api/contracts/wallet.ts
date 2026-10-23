import { z } from 'zod'
import { usernameRule } from './auth'
import { ensSuffix, evmAddress, isoDate, networkId, walletType } from './common'
import { ensLabelRule } from './profile'

export const walletSlots = ['primary', 'secondary'] as const
export const walletSlot = z.enum(walletSlots)
export type WalletSlot = z.infer<typeof walletSlot>

export const walletFields = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe o nome de exibição')
    .max(40, 'Use no máximo 40 caracteres'),
  nickname: z
    .string()
    .trim()
    .min(2, 'Informe o apelido da carteira')
    .max(32, 'Use no máximo 32 caracteres'),
  network: networkId,
  profileName: usernameRule,
  address: evmAddress,
  secondaryAddress: z.string().trim().max(64, 'Use no máximo 64 caracteres'),
  type: walletType,
  referralCode: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{6,12}$/, 'Use de 6 a 12 letras maiúsculas ou números'),
  email: z.email('Informe um e-mail válido'),
  ens: z.object({ label: ensLabelRule, suffix: ensSuffix }),
})
export type WalletFields = z.infer<typeof walletFields>

export const wallet = walletFields.extend({
  id: z.string(),
  slot: walletSlot,
  updatedAt: isoDate,
  version: z.number().int().min(1),
})
export type Wallet = z.infer<typeof wallet>

export const walletList = z.object({ items: z.array(wallet) })
export type WalletList = z.infer<typeof walletList>

export const createWalletRequest = walletFields.extend({ slot: walletSlot })
export type CreateWalletRequest = z.infer<typeof createWalletRequest>

export const updateWalletRequest = walletFields.extend({ version: z.number().int().min(1) })
export type UpdateWalletRequest = z.infer<typeof updateWalletRequest>

export const walletConnectionStatus = z.enum(['connected', 'disconnected'])

export const walletConnection = z.object({
  id: z.string(),
  walletId: z.string(),
  network: networkId,
  address: evmAddress,
  status: walletConnectionStatus,
  connectedAt: isoDate,
})
export type WalletConnection = z.infer<typeof walletConnection>

export const connectWalletRequest = z.object({
  walletId: z.string(),
  network: networkId,
})
export type ConnectWalletRequest = z.infer<typeof connectWalletRequest>
