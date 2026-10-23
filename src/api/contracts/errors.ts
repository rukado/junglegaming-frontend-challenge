import { z } from 'zod'

export const apiErrorCodes = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'AVAILABILITY_CONFLICT',
  'QUOTE_CHANGED',
  'IDEMPOTENCY_CONFLICT',
  'COUPON_INVALID',
  'COUPON_EXPIRED',
  'WALLET_REJECTED',
  'PAYMENT_REJECTED',
  'RATE_LIMITED',
  'SERVICE_UNAVAILABLE',
  'INTERNAL',
] as const

export const apiErrorCode = z.enum(apiErrorCodes)
export type ApiErrorCode = z.infer<typeof apiErrorCode>

export const apiErrorBody = z.object({
  error: z.object({
    code: apiErrorCode,
    message: z.string(),
    fieldErrors: z.record(z.string(), z.string()).optional(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})
export type ApiErrorBody = z.infer<typeof apiErrorBody>
