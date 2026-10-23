import type { ZodError } from 'zod'
import { apiError } from '../network'

export function validationError(error: ZodError) {
  const fieldErrors: Record<string, string> = {}
  error.issues.forEach((issue) => {
    const key = issue.path.join('.') || 'form'
    if (!fieldErrors[key]) fieldErrors[key] = issue.message
  })
  return apiError(422, 'VALIDATION_ERROR', 'Revise os campos destacados.', { fieldErrors })
}
