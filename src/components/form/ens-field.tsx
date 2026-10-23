import { useId } from 'react'
import {
  Controller,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from 'react-hook-form'
import { ensSuffixes, type EnsSuffix } from '@/api/contracts'
import { inputBaseClass } from './field'
import { SelectField } from './select-field'

type EnsFieldProps<T extends FieldValues> = {
  control: Control<T>
  register: UseFormRegister<T>
  labelName: Path<T>
  suffixName: Path<T>
  error: FieldError | undefined
}

const suffixOptions = ensSuffixes.map((id) => ({ value: id, label: id }))

export function EnsField<T extends FieldValues>({
  control,
  register,
  labelName,
  suffixName,
  error,
}: EnsFieldProps<T>) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body text-foreground">
        Nome ENS
        <span aria-hidden="true" className="ml-0.5 text-lead leading-none text-[#e8664a]">
          *
        </span>
        <span className="sr-only"> (obrigatório)</span>
      </label>
      <div className="flex gap-2.5">
        <Controller
          control={control}
          name={suffixName}
          render={({ field }) => (
            <SelectField<EnsSuffix>
              label="Sufixo ENS"
              hideLabel
              value={field.value as EnsSuffix}
              options={suffixOptions}
              onChange={field.onChange}
              className="w-[88px] shrink-0 gap-0"
            />
          )}
        />
        <input
          id={inputId}
          autoComplete="off"
          spellCheck={false}
          placeholder="seu-nome"
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputBaseClass}
          {...register(labelName)}
        />
      </div>
      {error && (
        <p id={errorId} className="text-caption text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}
