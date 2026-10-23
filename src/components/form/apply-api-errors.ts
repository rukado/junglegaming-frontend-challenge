import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { toApiError } from '@/api/errors'

export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: ReadonlyArray<Path<T>>,
): string | null {
  const apiError = toApiError(error)
  let matched = false
  Object.entries(apiError.fieldErrors).forEach(([key, message]) => {
    const field = fields.find((candidate) => candidate === key || key.startsWith(`${candidate}.`))
    if (field) {
      matched = true
      setError(field, { type: 'server', message })
    }
  })
  if (matched && apiError.code === 'VALIDATION_ERROR') return null
  return apiError.message
}
