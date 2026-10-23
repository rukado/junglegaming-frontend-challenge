import { z } from 'zod'
import { collectorDetails, type User, type Wallet } from '@/api/contracts'

export const checkoutFormSchema = collectorDetails.extend({
  walletId: z.string(),
  useOtherWallet: z.boolean(),
  secondaryAddress: z
    .string()
    .trim()
    .max(64, 'Use no máximo 64 caracteres')
    .refine(
      (value) =>
        value === '' ||
        /^0x[a-fA-F0-9]{40}$/.test(value) ||
        /^[a-z0-9-]{3,32}\.(eth|nft|crypto)$/.test(value),
      'Informe um endereço 0x ou um nome ENS (ex.: nome.eth)',
    ),
})
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export function walletToFormValues(wallet: Wallet): Partial<CheckoutFormValues> {
  return {
    walletId: wallet.id,
    useOtherWallet: false,
    network: wallet.network,
    profileName: wallet.profileName,
    address: wallet.address,
    secondaryAddress: wallet.secondaryAddress,
    type: wallet.type,
    referralCode: wallet.referralCode,
    ens: wallet.ens,
  }
}

export function emptyWalletValues(): Partial<CheckoutFormValues> {
  return {
    walletId: '',
    network: 'ethereum',
    profileName: '',
    address: '',
    secondaryAddress: '',
    type: 'metamask',
    referralCode: '',
    ens: { label: '', suffix: '.eth' },
  }
}

export function initialCheckoutValues(user: User, wallets: Wallet[]): CheckoutFormValues {
  const primary = wallets.find((wallet) => wallet.slot === 'primary') ?? wallets[0]
  const walletValues = primary ? walletToFormValues(primary) : emptyWalletValues()
  return {
    displayName: primary?.displayName ?? user.displayName,
    username: user.username,
    email: primary?.email ?? user.email,
    note: '',
    walletId: '',
    useOtherWallet: false,
    network: 'ethereum',
    address: '',
    secondaryAddress: '',
    type: 'metamask',
    referralCode: '',
    ...walletValues,
    profileName: walletValues.profileName || user.username,
    ens: primary ? primary.ens : (user.ens ?? { label: '', suffix: '.eth' }),
  }
}
