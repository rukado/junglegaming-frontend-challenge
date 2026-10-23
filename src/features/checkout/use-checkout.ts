import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  quote as quoteSchema,
  type Cart,
  type CreateOrderRequest,
  type Quote,
  type Wallet,
  type WalletConnection,
} from '@/api/contracts'
import { ordersApi } from '@/api/endpoints/orders'
import { walletsApi } from '@/api/endpoints/wallets'
import { errorMessage, hasErrorCode, toApiError } from '@/api/errors'
import { queryKeys, type Viewer } from '@/app/query-keys'
import { quoteQueryOptions, useAcceptCartChanges } from '@/features/cart/queries'
import { useCreateWallet } from '@/features/wallets/queries'
import type { CheckoutFormValues } from './schema'
import { clearCheckoutDraft, clearIdempotencyKey, idempotencyKeyFor } from './storage'

export type CheckoutReview = {
  quote: Quote
  values: CheckoutFormValues
  connection: WalletConnection
  wallet: Wallet
  changed: boolean
}

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'uncertain'; message: string }
  | { status: 'error'; message: string }

class CheckoutError extends Error {}

function toCollector(values: CheckoutFormValues): CreateOrderRequest['collector'] {
  return {
    displayName: values.displayName,
    username: values.username,
    network: values.network,
    profileName: values.profileName,
    address: values.address,
    secondaryAddress: values.secondaryAddress,
    type: values.type,
    referralCode: values.referralCode,
    email: values.email,
    ens: values.ens,
    note: values.note,
  }
}

function buildOrderRequest(review: CheckoutReview): CreateOrderRequest {
  return {
    quoteId: review.quote.id,
    walletConnectionId: review.connection.id,
    expectedTotalEth: review.quote.totalEth,
    lines: review.quote.lines.map((line) => ({
      itemId: line.itemId,
      editionId: line.editionId,
      quantity: line.quantity,
      unitPriceEth: line.unitPriceEth,
    })),
    collector: toCollector(review.values),
  }
}

type UseCheckoutArgs = {
  userId: string
  viewer: Viewer
  cart: Cart
  wallets: Wallet[]
  displayedQuote: Quote | undefined
}

export function useCheckout({ userId, viewer, cart, wallets, displayedQuote }: UseCheckoutArgs) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const createWallet = useCreateWallet()
  const acceptCartChanges = useAcceptCartChanges()
  const [accepting, setAccepting] = useState(false)
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<Wallet | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const [review, setReview] = useState<CheckoutReview | null>(null)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })
  const [blocked, setBlocked] = useState<string | null>(null)

  async function resolveWallet(values: CheckoutFormValues): Promise<Wallet> {
    if (!values.useOtherWallet && values.walletId) {
      const saved = wallets.find((wallet) => wallet.id === values.walletId)
      if (saved) return saved
    }
    const sameAddress = wallets.find(
      (wallet) => wallet.address.toLowerCase() === values.address.toLowerCase(),
    )
    if (sameAddress) return sameAddress
    const slot = wallets.some((wallet) => wallet.slot === 'primary')
      ? wallets.some((wallet) => wallet.slot === 'secondary')
        ? null
        : 'secondary'
      : 'primary'
    if (!slot) {
      throw new CheckoutError(
        'Você já tem duas carteiras salvas. Edite uma delas em Carteiras para usar outro endereço.',
      )
    }
    return createWallet.mutateAsync({
      slot,
      displayName: values.displayName,
      nickname: slot === 'primary' ? 'Principal' : 'Reserva',
      network: values.network,
      profileName: values.profileName,
      address: values.address,
      secondaryAddress: values.secondaryAddress,
      type: values.type,
      referralCode: values.referralCode,
      email: values.email,
      ens: values.ens,
    })
  }

  async function ensureConnection(wallet: Wallet, values: CheckoutFormValues) {
    if (
      connection &&
      connection.status === 'connected' &&
      connection.walletId === wallet.id &&
      connection.network === values.network
    ) {
      return connection
    }
    if (connection && connection.status === 'connected') {
      await walletsApi.disconnect(connection.id).catch(() => undefined)
    }
    try {
      const next = await walletsApi.connect({ walletId: wallet.id, network: values.network })
      setConnection(next)
      setConnectedWallet(wallet)
      return next
    } catch (error) {
      setConnection(null)
      setConnectedWallet(null)
      if (hasErrorCode(error, 'WALLET_REJECTED')) {
        throw new CheckoutError(
          'A conexão foi recusada na carteira. Aprove a solicitação ou escolha outra carteira.',
        )
      }
      throw error
    }
  }

  async function startReview(values: CheckoutFormValues) {
    setPreparing(true)
    setPrepareError(null)
    setBlocked(null)
    try {
      const wallet = await resolveWallet(values)
      const activeConnection = await ensureConnection(wallet, values)
      const freshQuote = await queryClient.fetchQuery({
        ...quoteQueryOptions(viewer, cart.version, values.network),
        staleTime: 0,
      })
      setSubmit({ status: 'idle' })
      setReview({
        quote: freshQuote,
        values,
        connection: activeConnection,
        wallet,
        changed:
          displayedQuote !== undefined &&
          displayedQuote.network === freshQuote.network &&
          displayedQuote.totalEth !== freshQuote.totalEth,
      })
    } catch (error) {
      setPrepareError(error instanceof CheckoutError ? error.message : errorMessage(error))
    } finally {
      setPreparing(false)
    }
  }

  async function acceptChanges() {
    if (!review) return
    setAccepting(true)
    setSubmit({ status: 'idle' })
    try {
      const updated = await acceptCartChanges.mutateAsync()
      if (updated.items.length === 0) {
        setReview(null)
        setBlocked('Os itens do seu carrinho esgotaram.')
        return
      }
      const freshQuote = await queryClient.fetchQuery({
        ...quoteQueryOptions(viewer, updated.version, review.values.network),
        staleTime: 0,
      })
      setReview({ ...review, quote: freshQuote, changed: true })
    } catch (error) {
      setSubmit({ status: 'error', message: errorMessage(error) })
    } finally {
      setAccepting(false)
    }
  }

  async function disconnect() {
    if (!connection) return
    const current = connection
    setConnection(null)
    setConnectedWallet(null)
    await walletsApi.disconnect(current.id).catch(() => undefined)
  }

  function closeReview() {
    if (submit.status === 'submitting') return
    setReview(null)
    setSubmit({ status: 'idle' })
  }

  async function placeOrder() {
    if (!review) return
    const body = buildOrderRequest(review)
    const key = idempotencyKeyFor(JSON.stringify(body))
    setSubmit({ status: 'submitting' })
    try {
      const order = await ordersApi.create(body, key)
      clearIdempotencyKey()
      clearCheckoutDraft(userId)
      queryClient.setQueryData(queryKeys.user.order(userId, order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.activeOrders(userId) })
      await navigate({ to: '/orders/$orderId', params: { orderId: order.id }, replace: true })
    } catch (caught) {
      const error = toApiError(caught)
      if (error.code === 'QUOTE_CHANGED') {
        const parsed = quoteSchema.safeParse(error.details.quote)
        if (parsed.success) {
          queryClient.setQueryData(
            quoteQueryOptions(viewer, parsed.data.cartVersion, parsed.data.network).queryKey,
            parsed.data,
          )
          setReview({ ...review, quote: parsed.data, changed: true })
          setSubmit({ status: 'idle' })
          return
        }
      }
      if (error.code === 'AVAILABILITY_CONFLICT') {
        setReview(null)
        setSubmit({ status: 'idle' })
        setBlocked(error.message)
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
        void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
        return
      }
      if (error.code === 'CONFLICT' && error.details.reason === 'WALLET_DISCONNECTED') {
        setConnection(null)
        setConnectedWallet(null)
        setReview(null)
        setSubmit({ status: 'idle' })
        setPrepareError(error.message)
        return
      }
      if (error.kind === 'timeout' || error.kind === 'network' || error.isTransient) {
        setSubmit({
          status: 'uncertain',
          message:
            'Não recebemos a confirmação a tempo. Tente novamente: a mesma solicitação é reenviada e não gera uma compra duplicada.',
        })
        return
      }
      if (error.isAuthError) {
        setSubmit({ status: 'idle' })
        return
      }
      setSubmit({ status: 'error', message: error.message })
    }
  }

  return {
    connection,
    connectedWallet,
    preparing,
    prepareError,
    blocked,
    review,
    submit,
    startReview,
    closeReview,
    acceptChanges,
    accepting,
    placeOrder,
    disconnect,
  }
}
