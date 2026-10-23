import type { Wallet } from '@/api/contracts'
import { fixtureNow } from '../../config'
import { hashPassword } from '../crypto'
import type { CouponRecord, UserRecord } from '../types'

export const demoCredentials = [
  { email: 'ana@kurio.dev', password: 'kurio1234', displayName: 'Ana Colecionadora' },
  { email: 'bruno@kurio.dev', password: 'kurio5678', displayName: 'Bruno Artista' },
] as const

const createdAt = new Date(fixtureNow - 90 * 86_400_000).toISOString()

export async function buildUsers(): Promise<UserRecord[]> {
  const [ana, bruno] = demoCredentials
  return [
    {
      id: 'user_ana',
      email: ana.email,
      displayName: ana.displayName,
      username: 'ana.coleciona',
      ens: { label: 'ana-kurio', suffix: '.eth' },
      walletNickname: 'Cofre principal',
      avatarUrl: null,
      createdAt,
      version: 1,
      passwordSalt: 'salt_ana',
      passwordHash: await hashPassword(ana.password, 'salt_ana'),
    },
    {
      id: 'user_bruno',
      email: bruno.email,
      displayName: bruno.displayName,
      username: 'bruno.art',
      ens: null,
      walletNickname: null,
      avatarUrl: null,
      createdAt,
      version: 1,
      passwordSalt: 'salt_bruno',
      passwordHash: await hashPassword(bruno.password, 'salt_bruno'),
    },
  ]
}

export function buildWallets(): Record<string, Wallet[]> {
  const updatedAt = new Date(fixtureNow - 30 * 86_400_000).toISOString()
  return {
    user_ana: [
      {
        id: 'wallet_ana_primary',
        slot: 'primary',
        displayName: 'Ana Colecionadora',
        nickname: 'Cofre principal',
        network: 'ethereum',
        profileName: 'ana.coleciona',
        address: '0xA91F3c2b7D4e5F60718293a4B5c6D7e8F9012E82',
        secondaryAddress: '',
        type: 'metamask',
        referralCode: 'KURIOANA',
        email: 'ana@kurio.dev',
        ens: { label: 'ana-kurio', suffix: '.eth' },
        updatedAt,
        version: 1,
      },
    ],
    user_bruno: [],
  }
}

export function buildFavorites(): Record<string, string[]> {
  return {
    user_ana: ['emerald-ape-042', 'golden-beat-207'],
    user_bruno: [],
  }
}

export function buildCoupons(): CouponRecord[] {
  return [
    { code: 'KURIO10', percent: 10, label: 'Desconto do lançamento', expiresAt: null },
    { code: 'LANCAMENTO5', percent: 5, label: 'Desconto do lançamento', expiresAt: null },
    { code: 'BEMVINDO20', percent: 20, label: 'Boas-vindas', expiresAt: fixtureNow - 86_400_000 },
  ]
}
