import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Cart, User, Wallet } from '@/api/contracts'
import type { Viewer } from '@/app/query-keys'
import { FormAlert } from '@/components/form/field'
import { MobileScreenHeader } from '@/components/layout/mobile-screen-header'
import { useQuote } from '@/features/cart/queries'
import { activeOrdersQueryOptions } from '@/features/orders/queries'
import { cn } from '@/lib/utils'
import {
  checkoutFormSchema,
  emptyWalletValues,
  initialCheckoutValues,
  walletToFormValues,
  type CheckoutFormValues,
} from '../schema'
import { readCheckoutDraft, writeCheckoutDraft } from '../storage'
import { useCheckout } from '../use-checkout'
import { CheckoutSummary } from './checkout-summary'
import { CollectorForm } from './collector-form'
import { ReviewDialog } from './review-dialog'
import { SavedWallets } from './saved-wallets'
import { WalletProviderPicker } from './wallet-provider-picker'

type CheckoutViewProps = {
  user: User
  viewer: Viewer
  cart: Cart
  wallets: Wallet[]
}

export function CheckoutView({ user, viewer, cart, wallets }: CheckoutViewProps) {
  const [defaults] = useState<CheckoutFormValues>(() => ({
    ...initialCheckoutValues(user, wallets),
    ...readCheckoutDraft(user.id),
  }))
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: defaults,
    mode: 'onTouched',
  })
  const values = useWatch({ control: form.control }) as CheckoutFormValues
  const network = values.network ?? defaults.network
  const quote = useQuote(viewer, cart, network)
  const checkout = useCheckout({
    userId: user.id,
    viewer,
    cart,
    wallets,
    displayedQuote: quote.data,
  })
  const activeOrders = useQuery(activeOrdersQueryOptions(user.id))
  const pendingOrder = activeOrders.data?.items[0]
  const [profileOpen, setProfileOpen] = useState(wallets.length === 0)
  const names = useMemo(() => new Map(cart.items.map((item) => [item.id, item.name])), [cart.items])

  useEffect(() => {
    writeCheckoutDraft(user.id, values)
  }, [user.id, values])

  function selectWallet(wallet: Wallet) {
    const next = walletToFormValues(wallet)
    Object.entries(next).forEach(([key, value]) =>
      form.setValue(key as keyof CheckoutFormValues, value as never, {
        shouldValidate: form.formState.isSubmitted,
      }),
    )
    form.setValue('displayName', wallet.displayName)
    form.setValue('email', wallet.email)
  }

  function toggleOtherWallet(checked: boolean) {
    if (checked) {
      Object.entries({ ...emptyWalletValues(), useOtherWallet: true }).forEach(([key, value]) =>
        form.setValue(key as keyof CheckoutFormValues, value as never),
      )
      setProfileOpen(true)
      return
    }
    const primary = wallets.find((wallet) => wallet.slot === 'primary') ?? wallets[0]
    if (primary) selectWallet(primary)
  }

  const submit = form.handleSubmit(
    (data) => checkout.startReview(data),
    () => setProfileOpen(true),
  )

  const purchasable = quote.data?.purchasable ?? false
  const confirmDisabled =
    checkout.preparing || !quote.data || !purchasable || quote.isPlaceholderData

  return (
    <div className="container-page pt-8 pb-10 md:pt-6">
      <MobileScreenHeader title="Pagamento com carteira" className="mb-6" />
      <nav
        aria-label="Trilha de navegação"
        className="mb-8 hidden text-[15px] leading-4 font-bold text-foreground md:block"
      >
        <ol className="flex gap-1">
          <li>
            <Link to="/" className="hover:text-text-accent">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/cart" className="hover:text-text-accent">
              Carrinho
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Pagamento</li>
        </ol>
      </nav>
      <h1 className="sr-only hidden md:block">Pagamento</h1>

      {pendingOrder && (
        <output className="mb-6 flex flex-col gap-3 rounded-md border border-primary/60 bg-surface-dark/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3 text-body text-foreground">
            <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin text-text-accent" />
            Você tem uma compra em processamento. Acompanhe antes de iniciar outra.
          </span>
          <Link
            to="/orders/$orderId"
            params={{ orderId: pendingOrder.id }}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-body font-bold text-ink hover:bg-text-accent"
          >
            Acompanhar pedido
          </Link>
        </output>
      )}

      {checkout.blocked && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-2 rounded-md border border-destructive/60 bg-destructive/10 p-4 text-body text-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          {checkout.blocked}
          <Link
            to="/cart"
            className="shrink-0 font-bold text-text-accent underline underline-offset-4"
          >
            Revisar carrinho
          </Link>
        </div>
      )}

      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="flex flex-col gap-8 lg:grid lg:grid-cols-[763fr_405fr] lg:items-start lg:gap-x-8"
      >
        <div className="contents lg:flex lg:flex-col lg:gap-8">
          <SavedWallets
            wallets={wallets}
            selectedId={values.useOtherWallet ? '' : (values.walletId ?? '')}
            onSelect={(wallet) => {
              form.setValue('useOtherWallet', false)
              selectWallet(wallet)
            }}
            className="order-1 lg:order-none"
          />
          <div className="order-3 flex flex-col gap-3 lg:order-none">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-controls="collector-profile"
              className="flex items-center justify-between rounded-[14px] bg-surface-card px-5 py-4 text-left text-body-lg font-bold text-foreground lg:hidden"
            >
              Perfil do colecionador
              <ChevronDown
                aria-hidden="true"
                className={cn('size-5 transition-transform', profileOpen && 'rotate-180')}
              />
            </button>
            <div id="collector-profile" className={cn(!profileOpen && 'hidden lg:block')}>
              <CollectorForm
                form={form}
                hasSavedWallets={wallets.length > 0}
                onUseOtherWalletChange={toggleOtherWallet}
              />
            </div>
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <CheckoutSummary cart={cart} quote={quote} className="order-4 lg:order-none" />
          <WalletProviderPicker
            value={values.type ?? defaults.type}
            onChange={(type) => form.setValue('type', type, { shouldDirty: true })}
            connection={checkout.connection}
            connectedWallet={checkout.connectedWallet}
            onDisconnect={() => void checkout.disconnect()}
            connecting={checkout.preparing}
            className="order-2 lg:order-none"
          />
          <div className="order-5 flex flex-col gap-3 lg:order-none">
            <FormAlert message={checkout.prepareError} />
            {quote.data && !purchasable && !quote.isPlaceholderData && (
              <p role="alert" className="text-caption text-destructive">
                Seu carrinho tem itens com preço ou disponibilidade alterados.{' '}
                <Link
                  to="/cart"
                  className="font-bold text-text-accent underline underline-offset-4"
                >
                  Revisar carrinho
                </Link>
              </p>
            )}
            <button
              type="submit"
              disabled={confirmDisabled}
              aria-busy={checkout.preparing || undefined}
              className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-primary to-[#9b6537] text-body-lg font-bold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:h-[45px] lg:rounded-lg lg:bg-primary lg:bg-none lg:text-[15px] lg:hover:bg-text-accent"
            >
              {checkout.preparing && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {checkout.preparing ? 'Conectando carteira…' : 'Confirmar compra'}
            </button>
          </div>
        </div>
      </form>

      <ReviewDialog
        review={checkout.review}
        submit={checkout.submit}
        names={names}
        onConfirm={() => void checkout.placeOrder()}
        onAcceptChanges={() => void checkout.acceptChanges()}
        accepting={checkout.accepting}
        onClose={checkout.closeReview}
      />
    </div>
  )
}
