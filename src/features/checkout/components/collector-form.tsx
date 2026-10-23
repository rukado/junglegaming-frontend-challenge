import { useId } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { TextField } from '@/components/form/field'
import { WalletFieldsGrid } from '@/features/wallets/components/wallet-fields'
import type { WalletFieldsShape } from '@/features/wallets/schema'
import type { CheckoutFormValues } from '../schema'

type CollectorFormProps = {
  form: UseFormReturn<CheckoutFormValues>
  hasSavedWallets: boolean
  onUseOtherWalletChange: (checked: boolean) => void
}

export function CollectorForm({
  form,
  hasSavedWallets,
  onUseOtherWalletChange,
}: CollectorFormProps) {
  const { register, formState, watch } = form
  const errors = formState.errors
  const noteId = useId()
  const noteErrorId = useId()
  const otherWalletId = useId()
  const lockedWallet = watch('walletId') !== '' && !watch('useOtherWallet')

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-[17px] leading-4 font-bold text-foreground">
        Perfil do colecionador
      </legend>
      <WalletFieldsGrid
        form={form as unknown as UseFormReturn<WalletFieldsShape>}
        lockedAddress={lockedWallet}
        addressHint={lockedWallet ? 'Endereço da carteira salva selecionada.' : undefined}
        secondField={
          <TextField
            label="Nome de usuário"
            required
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
        }
      />

      {hasSavedWallets && (
        <label
          htmlFor={otherWalletId}
          className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-[15px] text-foreground"
        >
          <input
            id={otherWalletId}
            type="checkbox"
            className="size-[15px] cursor-pointer appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2px_var(--ink)]"
            {...register('useOtherWallet', {
              onChange: (event: { target: { checked: boolean } }) =>
                onUseOtherWalletChange(event.target.checked),
            })}
          />
          Usar outra carteira?
        </label>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:max-w-[350px]">
        <label htmlFor={noteId} className="text-[15px] text-foreground">
          Observação do colecionador (opcional)
        </label>
        <textarea
          id={noteId}
          rows={6}
          maxLength={280}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={errors.note ? noteErrorId : undefined}
          className="min-h-[152px] w-full resize-y rounded-sm border border-border bg-transparent px-4 py-3 text-body text-foreground outline-none focus-visible:border-text-accent focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
          {...register('note')}
        />
        {errors.note && (
          <p id={noteErrorId} className="text-caption text-destructive">
            {errors.note.message}
          </p>
        )}
      </div>
    </fieldset>
  )
}
