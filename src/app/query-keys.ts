import type { NftListParams } from '@/api/contracts'

export type Viewer = { kind: 'user'; userId: string } | { kind: 'guest'; cartId: string }

export const queryKeys = {
  session: (token: string | null) => ['session', token] as const,
  nfts: {
    all: ['nfts'] as const,
    lists: () => ['nfts', 'list'] as const,
    list: (params: NftListParams) => ['nfts', 'list', params] as const,
    featured: () => ['nfts', 'featured'] as const,
    details: () => ['nfts', 'detail'] as const,
    detail: (nftId: string) => ['nfts', 'detail', nftId] as const,
    related: (nftId: string) => ['nfts', 'related', nftId] as const,
  },
  user: {
    all: (userId: string) => ['user', userId] as const,
    favorites: (userId: string) => ['user', userId, 'favorites'] as const,
    profile: (userId: string) => ['user', userId, 'profile'] as const,
    wallets: (userId: string) => ['user', userId, 'wallets'] as const,
    orders: (userId: string) => ['user', userId, 'orders'] as const,
    order: (userId: string, orderId: string) => ['user', userId, 'orders', orderId] as const,
    activeOrders: (userId: string) => ['user', userId, 'orders', 'active'] as const,
  },
  cart: {
    all: ['cart'] as const,
    owner: (viewer: Viewer) =>
      [
        'cart',
        viewer.kind === 'user' ? `user:${viewer.userId}` : `guest:${viewer.cartId}`,
      ] as const,
    quote: (viewer: Viewer, cartVersion: number, network: string) =>
      [...queryKeys.cart.owner(viewer), 'quote', cartVersion, network] as const,
  },
}
