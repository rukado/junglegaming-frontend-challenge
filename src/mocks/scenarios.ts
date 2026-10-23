import type { ApiErrorCode } from '@/api/contracts'
import type { PaymentOutcome } from './db/types'

export type LatencyProfile = 'none' | 'fast' | 'slow' | 'variable' | 'out-of-order'

export type RouteKey =
  | 'nfts:list'
  | 'nfts:detail'
  | 'nfts:featured'
  | 'favorites:read'
  | 'favorites:write'
  | 'cart:read'
  | 'cart:write'
  | 'quotes:create'
  | 'orders:create'
  | 'orders:read'
  | 'auth'
  | 'profile'
  | 'wallets'

export type FailureRule = {
  route: RouteKey | 'any'
  status: number
  code: ApiErrorCode
  message: string
  times?: number
}

export type Scenario = {
  id: string
  label: string
  description: string
  latency: LatencyProfile
  offline?: boolean
  emptyCatalog?: boolean
  failures?: FailureRule[]
  expireSessionOnce?: boolean
  priceChangeAfterQuote?: boolean
  soldOutOnOrder?: boolean
  orderResponseTimeoutOnce?: boolean
  paymentOutcome: PaymentOutcome
  settleDelayMs?: number
  walletRejects?: boolean
  walletDisconnectsAfterMs?: number
  socketOffline?: boolean
}

const base = { latency: 'fast', paymentOutcome: 'confirmed' } as const

export const scenarios: Scenario[] = [
  {
    ...base,
    id: 'default',
    label: 'Padrão',
    description: 'Tudo funcionando com latência curta e determinística.',
  },
  {
    ...base,
    id: 'instant',
    label: 'Sem latência',
    description: 'Respostas imediatas, útil para testes.',
    latency: 'none',
  },
  {
    ...base,
    id: 'empty-catalog',
    label: 'Catálogo vazio',
    description: 'A listagem de NFTs não retorna resultados.',
    emptyCatalog: true,
  },
  {
    ...base,
    id: 'slow-network',
    label: 'Rede lenta',
    description: 'Todas as respostas levam cerca de 2,5 s.',
    latency: 'slow',
  },
  {
    ...base,
    id: 'variable-latency',
    label: 'Latência variável',
    description: 'Cada requisição leva entre 0,2 s e 2,2 s.',
    latency: 'variable',
  },
  {
    ...base,
    id: 'out-of-order',
    label: 'Respostas fora de ordem',
    description: 'Buscas consecutivas no catálogo respondem em ordem invertida.',
    latency: 'out-of-order',
  },
  {
    ...base,
    id: 'offline',
    label: 'Sem conexão',
    description: 'Todas as chamadas à API falham por erro de rede.',
    offline: true,
  },
  {
    ...base,
    id: 'server-error',
    label: 'Erro 503 no catálogo',
    description: 'A listagem e o detalhe de NFTs respondem 503.',
    failures: [
      {
        route: 'nfts:list',
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Catálogo temporariamente indisponível.',
      },
      {
        route: 'nfts:detail',
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Catálogo temporariamente indisponível.',
      },
    ],
  },
  {
    ...base,
    id: 'flaky-catalog',
    label: 'Catálogo instável',
    description:
      'As 3 primeiras chamadas ao catálogo falham com 500 e depois o serviço se recupera.',
    failures: [
      {
        route: 'nfts:list',
        status: 500,
        code: 'INTERNAL',
        message: 'Falha temporária no catálogo.',
        times: 3,
      },
    ],
  },
  {
    ...base,
    id: 'favorites-failure',
    label: 'Falha ao favoritar',
    description: 'Incluir ou remover favoritos responde 500.',
    failures: [
      {
        route: 'favorites:write',
        status: 500,
        code: 'INTERNAL',
        message: 'Não foi possível atualizar os favoritos.',
      },
    ],
  },
  {
    ...base,
    id: 'session-expired',
    label: 'Sessão expirada',
    description: 'A próxima requisição autenticada encontra a sessão expirada.',
    expireSessionOnce: true,
  },
  {
    ...base,
    id: 'price-change-at-checkout',
    label: 'Preço alterado no checkout',
    description:
      'Logo após a primeira cotação, o preço do primeiro item do carrinho sobe e um evento nft.updated é emitido.',
    priceChangeAfterQuote: true,
  },
  {
    ...base,
    id: 'sold-out-at-checkout',
    label: 'Edição esgotada na compra',
    description: 'Ao enviar o pedido, a edição do primeiro item esgota.',
    soldOutOnOrder: true,
  },
  {
    ...base,
    id: 'order-timeout',
    label: 'Timeout após criar pedido',
    description: 'O pedido é criado, mas a primeira resposta excede o timeout do cliente.',
    orderResponseTimeoutOnce: true,
  },
  {
    ...base,
    id: 'payment-rejected',
    label: 'Pagamento recusado',
    description: 'O pedido é recusado na liquidação.',
    paymentOutcome: 'rejected',
  },
  {
    ...base,
    id: 'payment-pending',
    label: 'Pagamento pendente',
    description: 'O pedido fica pendente até ser liquidado manualmente pelo painel.',
    paymentOutcome: 'manual',
  },
  {
    ...base,
    id: 'wallet-rejected',
    label: 'Carteira recusa conexão',
    description: 'A conexão com a carteira é recusada.',
    walletRejects: true,
  },
  {
    ...base,
    id: 'wallet-disconnect',
    label: 'Carteira desconecta',
    description: 'A carteira conectada se desconecta após 4 segundos.',
    walletDisconnectsAfterMs: 4_000,
  },
  {
    ...base,
    id: 'socket-offline',
    label: 'Tempo real offline',
    description: 'O servidor Socket.IO recusa conexões.',
    socketOffline: true,
  },
]

const storageKey = 'kurio.mock.scenario'

type Runtime = {
  scenario: Scenario
  failureCounts: Map<FailureRule, number>
  sequence: number
  listSequence: number
  sessionExpiredFired: boolean
  priceChangeFired: boolean
  soldOutFired: boolean
  timeoutFired: boolean
}

function find(id: string | null): Scenario {
  return scenarios.find((scenario) => scenario.id === id) ?? (scenarios[0] as Scenario)
}

function readStoredId(): string | null {
  try {
    return window.localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

const runtime: Runtime = {
  scenario: find(readStoredId()),
  failureCounts: new Map(),
  sequence: 0,
  listSequence: 0,
  sessionExpiredFired: false,
  priceChangeFired: false,
  soldOutFired: false,
  timeoutFired: false,
}

const listeners = new Set<() => void>()

export function getScenario(): Scenario {
  return runtime.scenario
}

export function getRuntime() {
  return runtime
}

export function setScenario(id: string): Scenario {
  runtime.scenario = find(id)
  runtime.failureCounts = new Map()
  runtime.sequence = 0
  runtime.listSequence = 0
  runtime.sessionExpiredFired = false
  runtime.priceChangeFired = false
  runtime.soldOutFired = false
  runtime.timeoutFired = false
  try {
    window.localStorage.setItem(storageKey, runtime.scenario.id)
  } catch {
    return runtime.scenario
  }
  listeners.forEach((listener) => listener())
  return runtime.scenario
}

export function subscribeScenario(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
