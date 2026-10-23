import type { QueryClient } from '@tanstack/react-query'
import type {
  Cart,
  FavoritesResponse,
  NftDetail,
  NftSummary,
  NftUpdatedEvent,
  Order,
  OrderUpdatedEvent,
} from '@/api/contracts'
import { queryKeys } from '@/app/query-keys'
import { formatEthAmount } from '@/lib/format'

const maxRememberedEvents = 500

export type ApplyResult = { applied: boolean; announcement: string | null }

const skipped: ApplyResult = { applied: false, announcement: null }

export function createEventLedger() {
  const seen = new Set<string>()
  const versions = new Map<string, number>()
  return {
    accept(eventId: string, resourceKey: string, version: number) {
      if (seen.has(eventId)) return false
      seen.add(eventId)
      if (seen.size > maxRememberedEvents) {
        const oldest = seen.values().next().value
        if (oldest !== undefined) seen.delete(oldest)
      }
      const known = versions.get(resourceKey) ?? 0
      if (version <= known) return false
      versions.set(resourceKey, version)
      return true
    },
    reset() {
      seen.clear()
      versions.clear()
    },
  }
}

export type EventLedger = ReturnType<typeof createEventLedger>

function patchSummary<T extends NftSummary>(item: T, event: NftUpdatedEvent): T {
  if (item.id !== event.resource.id || item.version >= event.version) return item
  return {
    ...item,
    priceEth: event.data.priceEth,
    available: event.data.available,
    version: event.version,
  }
}

function patchItems<T extends { items: NftSummary[] }>(
  data: T | undefined,
  event: NftUpdatedEvent,
) {
  if (!data || !Array.isArray(data.items)) return data
  if (!data.items.some((item) => item.id === event.resource.id)) return data
  return { ...data, items: data.items.map((item) => patchSummary(item, event)) }
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent): ApplyResult {
  const nftId = event.resource.id
  const detailKey = queryKeys.nfts.detail(nftId)
  const detail = queryClient.getQueryData<NftDetail>(detailKey)
  if (detail && detail.version >= event.version) return skipped

  let announcement: string | null = null
  if (detail) {
    const editions = detail.editions.map((edition) => {
      const update = event.data.editions.find((candidate) => candidate.id === edition.id)
      return update
        ? { ...edition, priceEth: update.priceEth, available: update.available }
        : edition
    })
    queryClient.setQueryData<NftDetail>(detailKey, {
      ...detail,
      editions,
      priceEth: event.data.priceEth,
      available: event.data.available,
      version: event.version,
    })
    if (queryClient.getQueryCache().find({ queryKey: detailKey })?.isActive()) {
      announcement =
        event.data.available === 0
          ? `${detail.name} esgotou.`
          : `${detail.name} atualizado: a partir de ${formatEthAmount(event.data.priceEth)}, ${event.data.available} disponíveis.`
    }
  }

  queryClient.setQueriesData<{ items: NftSummary[] }>(
    { queryKey: queryKeys.nfts.all, predicate: (query) => query.queryKey[1] !== 'detail' },
    (data) => patchItems(data, event),
  )
  queryClient.setQueriesData<FavoritesResponse>(
    { predicate: (query) => query.queryKey[0] === 'user' && query.queryKey[2] === 'favorites' },
    (data) => patchItems(data, event),
  )

  const carts = queryClient.getQueriesData<Cart>({ queryKey: queryKeys.cart.all })
  const inCart = carts.some(
    ([key, cart]) => key.length === 2 && cart?.items.some((item) => item.nftId === nftId),
  )
  if (inCart) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
    const name = carts
      .flatMap(([, cart]) => cart?.items ?? [])
      .find((item) => item.nftId === nftId)?.name
    announcement ??= name
      ? `${name}, que está no seu carrinho, teve preço ou disponibilidade atualizados.`
      : null
  }
  return { applied: true, announcement }
}

const orderStatusLabels: Record<Order['status'], string> = {
  pending: 'em processamento',
  confirmed: 'confirmado',
  rejected: 'recusado',
}

export function applyOrderUpdated(
  queryClient: QueryClient,
  event: OrderUpdatedEvent,
  userId: string | null,
): ApplyResult {
  if (!userId || event.userId !== userId) return skipped
  const key = queryKeys.user.order(userId, event.resource.id)
  const current = queryClient.getQueryData<Order>(key)
  if (current && current.version >= event.version) return skipped
  const statusChanged = current?.status !== event.data.status
  if (current) {
    queryClient.setQueryData<Order>(key, {
      ...current,
      ...event.data,
      version: event.version,
    })
  } else {
    void queryClient.invalidateQueries({ queryKey: key })
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.user.activeOrders(userId) })
  if (event.data.status !== 'pending') {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
  }
  return {
    applied: true,
    announcement: statusChanged
      ? `Pedido ${event.resource.id} ${orderStatusLabels[event.data.status]}.`
      : null,
  }
}
