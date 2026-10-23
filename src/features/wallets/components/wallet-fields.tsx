import type { ReactNode } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { networkIds, networkLabels, walletTypeLabels, walletTypes } from '@/api/contracts'
import { EnsField } from '@/components/form/ens-field'
import { TextField } from '@/components/form/field'
import { SelectField } from '@/components/form/select-field'
import { cn } from '@/lib/utils'
import type { WalletFieldsShape } from '../schema'

type WalletFieldsGridProps = {
  form: UseFormReturn<WalletFieldsShape>
  secondField: ReactNode
  lockedAddress?: boolean
  addressHint?: string
  className?: string
}

const networkOptions = networkIds.map((id) => ({ value: id, label: networkLabels[id] }))
const walletOptions = walletTypes.map((id) => ({ value: id, label: walletTypeLabels[id] }))

export function WalletFieldsGrid({
  form,
  secondField,
  lockedAddress = false,
  addressHint,
  className,
}: WalletFieldsGridProps) {
  const { register, control, formState } = form
  const errors = formState.errors
  return (
    <div className={cn('grid gap-x-6 gap-y-3 sm:grid-cols-2', className)}>
      <TextField
        label="Nome de exibição"
        required
        autoComplete="name"
        error={errors.displayName?.message}
        {...register('displayName')}
      />
      {secondField}
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
        readOnly={lockedAddress}
        hint={addressHint}
        inputClassName={cn(lockedAddress && 'cursor-not-allowed text-text-secondary')}
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
        {...register('referralCode', { setValueAs: (value: string) => value.toUpperCase() })}
      />
      <TextField
        label="E-mail"
        type="email"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <EnsField
        control={control}
        register={register}
        labelName="ens.label"
        suffixName="ens.suffix"
        error={errors.ens?.label}
      />
    </div>
  )
}
