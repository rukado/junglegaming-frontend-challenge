import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { Wallet, WalletSlot } from '@/api/contracts'
import { toApiError } from '@/api/errors'
import { ActionButton } from '@/components/common/action-button'
import { applyApiErrors } from '@/components/form/apply-api-errors'
import { FormAlert, TextField } from '@/components/form/field'
import { useCreateWallet, useUpdateWallet } from '../queries'
import {
  walletFormDefaults,
  walletFormSchema,
  type WalletFieldsShape,
  type WalletFormValues,
} from '../schema'
import { WalletFieldsGrid } from './wallet-fields'

const slotTitles: Record<WalletSlot, string> = {
  primary: 'Carteira principal',
  secondary: 'Carteira secundária',
}

const formFields = [
  'displayName',
  'nickname',
  'network',
  'profileName',
  'address',
  'secondaryAddress',
  'type',
  'referralCode',
  'email',
  'ens.label',
] as const

type WalletFormProps = {
  slot: WalletSlot
  wallet: Wallet | undefined
  initial: WalletFormValues
  onSaved: () => void
  onCancel?: () => void
}

function WalletForm({ slot, wallet, initial, onSaved, onCancel }: WalletFormProps) {
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: initial,
    mode: 'onTouched',
  })
  const pending = createWallet.isPending || updateWallet.isPending

  const submit = form.handleSubmit(async (values) => {
    setFormError(null)
    try {
      const saved = wallet
        ? await updateWallet.mutateAsync({
            walletId: wallet.id,
            body: { ...values, version: wallet.version },
          })
        : await createWallet.mutateAsync({ ...values, slot })
      form.reset(walletFormDefaults(saved))
      toast.success(`${slotTitles[slot]} salva.`)
      onSaved()
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.code === 'CONFLICT' && Object.keys(apiError.fieldErrors).length === 0) {
        setFormError(apiError.message)
        return
      }
      setFormError(applyApiErrors(error, form.setError, formFields))
    }
  })

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      <WalletFieldsGrid
        form={form as unknown as UseFormReturn<WalletFieldsShape>}
        className="gap-x-7 gap-y-5"
        secondField={
          <TextField
            label="Apelido da carteira"
            required
            error={form.formState.errors.nickname?.message}
            {...form.register('nickname')}
          />
        }
      />
      <FormAlert message={formError} />
      <div className="flex items-center gap-4">
        <ActionButton
          type="submit"
          pending={pending}
          pendingLabel="Salvando…"
          className="rounded-[3px] px-1.5"
        >
          Salvar carteira
        </ActionButton>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-body text-foreground hover:text-text-accent"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

type WalletSectionProps = {
  slot: WalletSlot
  wallet: Wallet | undefined
  primary?: Wallet
}

export function WalletSection({ slot, wallet, primary }: WalletSectionProps) {
  const titleId = useId()
  const copyId = useId()
  const [adding, setAdding] = useState(false)
  const [copyPrimary, setCopyPrimary] = useState(false)
  const editing = wallet !== undefined || adding

  const initial: WalletFormValues =
    wallet || !copyPrimary || !primary
      ? walletFormDefaults(wallet)
      : { ...walletFormDefaults(primary), address: '', nickname: '', secondaryAddress: '' }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-lead leading-4 font-bold text-foreground">
            {slotTitles[slot]}
          </h2>
          <p className="text-body text-text-secondary">
            {editing
              ? slot === 'primary'
                ? 'Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.'
                : 'Usada como alternativa no pagamento.'
              : slot === 'primary'
                ? 'Você ainda não adicionou uma carteira principal.'
                : 'Você ainda não adicionou uma carteira secundária.'}
          </p>
        </div>
        {!editing && (
          <div className="flex items-center gap-2">
            {slot === 'secondary' && primary && (
              <label
                htmlFor={copyId}
                className="flex cursor-pointer items-center gap-2 text-body text-foreground"
              >
                <input
                  id={copyId}
                  type="checkbox"
                  checked={copyPrimary}
                  onChange={(event) => setCopyPrimary(event.target.checked)}
                  className="size-[15px] cursor-pointer appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--ink)]"
                />
                Igual à carteira principal
              </label>
            )}
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="text-body-lg font-bold text-text-accent hover:underline"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>
      {editing && (
        <WalletForm
          key={`${wallet?.id ?? 'new'}-${wallet?.version ?? 0}-${copyPrimary}`}
          slot={slot}
          wallet={wallet}
          initial={initial}
          onSaved={() => setAdding(false)}
          onCancel={wallet ? undefined : () => setAdding(false)}
        />
      )}
    </section>
  )
}
