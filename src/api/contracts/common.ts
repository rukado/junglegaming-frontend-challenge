import { z } from 'zod'

export const ethAmount = z.string().regex(/^\d+(\.\d{1,18})?$/, 'Valor ETH inválido')
export const isoDate = z.iso.datetime({ offset: true })

export const networkIds = ['ethereum', 'polygon', 'solana'] as const
export const networkId = z.enum(networkIds)
export type NetworkId = z.infer<typeof networkId>

export const networkLabels: Record<NetworkId, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export const walletTypes = ['metamask', 'walletconnect', 'coinbase'] as const
export const walletType = z.enum(walletTypes)
export type WalletType = z.infer<typeof walletType>

export const walletTypeLabels: Record<WalletType, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

export const ensSuffixes = ['.eth', '.nft', '.crypto'] as const
export const ensSuffix = z.enum(ensSuffixes)
export type EnsSuffix = z.infer<typeof ensSuffix>

export const ensName = z.object({
  label: z.string(),
  suffix: ensSuffix,
})
export type EnsName = z.infer<typeof ensName>

export const evmAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço 0x inválido')

export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  })
}
