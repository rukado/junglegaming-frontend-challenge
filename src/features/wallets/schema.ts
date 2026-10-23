import { z } from 'zod'
import { walletFields, type Wallet, type WalletFields } from '@/api/contracts'

export const secondaryAddressRule = z
  .string()
  .trim()
  .max(64, 'Use no máximo 64 caracteres')
  .refine(
    (value) =>
      value === '' ||
      /^0x[a-fA-F0-9]{40}$/.test(value) ||
      /^[a-z0-9-]{3,32}\.(eth|nft|crypto)$/.test(value),
    'Informe um endereço 0x ou um nome ENS (ex.: nome.eth)',
  )

export const walletFormSchema = walletFields.extend({ secondaryAddress: secondaryAddressRule })
export type WalletFormValues = z.infer<typeof walletFormSchema>

export type WalletFieldsShape = Pick<
  WalletFields,
  | 'displayName'
  | 'network'
  | 'profileName'
  | 'address'
  | 'secondaryAddress'
  | 'type'
  | 'referralCode'
  | 'email'
  | 'ens'
>

export function walletFormDefaults(wallet: Wallet | undefined): WalletFormValues {
  return {
    displayName: wallet?.displayName ?? '',
    nickname: wallet?.nickname ?? '',
    network: wallet?.network ?? 'ethereum',
    profileName: wallet?.profileName ?? '',
    address: wallet?.address ?? '',
    secondaryAddress: wallet?.secondaryAddress ?? '',
    type: wallet?.type ?? 'metamask',
    referralCode: wallet?.referralCode ?? '',
    email: wallet?.email ?? '',
    ens: wallet?.ens ?? { label: '', suffix: '.eth' },
  }
}
