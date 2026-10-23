import type {
  CartItem,
  CollectorDetails,
  NftDetail,
  Order,
  Quote,
  User,
  Wallet,
  WalletConnection,
} from '@/api/contracts'

export type UserRecord = User & { passwordHash: string; passwordSalt: string }

export type SessionRecord = { token: string; userId: string; expiresAt: number }

export type CartRecord = {
  id: string
  ownerType: 'guest' | 'user'
  ownerId: string
  items: CartItem[]
  couponCode: string | null
  updatedAt: string
  version: number
}

export type CouponRecord = {
  code: string
  percent: number
  label: string
  expiresAt: number | null
}

export type QuoteRecord = Quote & { ownerKey: string }

export type PaymentOutcome = 'confirmed' | 'rejected' | 'manual'

export type OrderRecord = Order & {
  userId: string
  idempotencyKey: string
  requestHash: string
  settleAt: number | null
  outcome: PaymentOutcome
  collector: CollectorDetails
  cartId: string
}

export type MockDb = {
  schemaVersion: number
  nfts: NftDetail[]
  users: UserRecord[]
  sessions: SessionRecord[]
  carts: CartRecord[]
  favorites: Record<string, string[]>
  wallets: Record<string, Wallet[]>
  connections: Array<WalletConnection & { userId: string }>
  quotes: QuoteRecord[]
  orders: OrderRecord[]
  coupons: CouponRecord[]
  eventSeq: number
}
