import { useId } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import {
  ensSuffixes,
  networkIds,
  networkLabels,
  walletTypeLabels,
  walletTypes,
  type EnsSuffix,
} from '@/api/contracts'
import { TextField } from '@/components/form/field'
import { SelectField } from '@/components/form/select-field'
import { cn } from '@/lib/utils'
import type { CheckoutFormValues } from '../schema'

type CollectorFormProps = {
  form: UseFormReturn<CheckoutFormValues>
  hasSavedWallets: boolean
  onUseOtherWalletChange: (checked: boolean) => void
}

const networkOptions = networkIds.map((id) => ({ value: id, label: networkLabels[id] }))
const walletOptions = walletTypes.map((id) => ({ value: id, label: walletTypeLabels[id] }))
const suffixOptions = ensSuffixes.map((id) => ({ value: id, label: id }))

export function CollectorForm({
  form,
  hasSavedWallets,
  onUseOtherWalletChange,
}: CollectorFormProps) {
  const { register, control, formState, watch } = form
  const errors = formState.errors
  const noteId = useId()
  const noteErrorId = useId()
  const ensId = useId()
  const otherWalletId = useId()
  const lockedWallet = watch('walletId') !== '' && !watch('useOtherWallet')
  const lockedHint = lockedWallet ? 'Endereço da carteira salva selecionada.' : undefined

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-[17px] leading-4 font-bold text-foreground">
        Perfil do colecionador
      </legend>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <TextField
          label="Nome de exibição"
          required
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <TextField
          label="Nome de usuário"
          required
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Controller
          control={control}
          name="network"
          render={({ field, fieldState }) => (
            <SelectField
              label="Rede"
              required
              placeholder="Selecione uma rede"
              value={field.value}
              options={networkOptions}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <TextField
          label="Nome do perfil"
          required
          error={errors.profileName?.message}
          {...register('profileName')}
        />
        <TextField
          label="Endereço da carteira"
          required
          placeholder="Endereço 0x da carteira"
          autoComplete="off"
          spellCheck={false}
          readOnly={lockedWallet}
          hint={lockedHint}
          inputClassName={cn(lockedWallet && 'cursor-not-allowed text-text-secondary')}
          error={errors.address?.message}
          {...register('address')}
        />
        <TextField
          label="ENS ou carteira secundária (opcional)"
          placeholder="nome.eth ou 0x…"
          autoComplete="off"
          spellCheck={false}
          error={errors.secondaryAddress?.message}
          {...register('secondaryAddress')}
        />
        <Controller
          control={control}
          name="type"
          render={({ field, fieldState }) => (
            <SelectField
              label="Tipo de carteira"
              required
              placeholder="Selecione uma carteira"
              value={field.value}
              options={walletOptions}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <TextField
          label="Código de indicação"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          error={errors.referralCode?.message}
          {...register('referralCode', {
            setValueAs: (value: string) => value.toUpperCase(),
          })}
        />
        <TextField
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor={ensId} className="text-body text-foreground">
            Nome ENS
            <span aria-hidden="true" className="ml-0.5 text-lead leading-none text-[#e8664a]">
              *
            </span>
            <span className="sr-only"> (obrigatório)</span>
          </label>
          <div className="flex gap-2">
            <input
              id={ensId}
              autoComplete="off"
              spellCheck={false}
              placeholder="seu-nome"
              aria-required
              aria-invalid={errors.ens?.label ? true : undefined}
              aria-describedby={errors.ens?.label ? `${ensId}-error` : undefined}
              className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-transparent px-4 text-body text-foreground outline-none placeholder:text-sand focus-visible:border-text-accent focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
              {...register('ens.label')}
            />
            <Controller
              control={control}
              name="ens.suffix"
              render={({ field }) => (
                <SelectField<EnsSuffix>
                  label="Sufixo ENS"
                  hideLabel
                  value={field.value}
                  options={suffixOptions}
                  onChange={field.onChange}
                  className="w-[88px] shrink-0 gap-0"
                />
              )}
            />
          </div>
          {errors.ens?.label && (
            <p id={`${ensId}-error`} className="text-caption text-destructive">
              {errors.ens.label.message}
            </p>
          )}
        </div>
      </div>

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
