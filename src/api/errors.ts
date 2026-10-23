import { isAxiosError, isCancel } from 'axios'
import { apiErrorBody, type ApiErrorCode } from './contracts'

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'canceled' | 'contract'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly code: ApiErrorCode | null
  readonly fieldErrors: Record<string, string>
  readonly details: Record<string, unknown>

  constructor(init: {
    kind: ApiErrorKind
    message: string
    status?: number | null
    code?: ApiErrorCode | null
    fieldErrors?: Record<string, string>
    details?: Record<string, unknown>
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status ?? null
    this.code = init.code ?? null
    this.fieldErrors = init.fieldErrors ?? {}
    this.details = init.details ?? {}
  }

  get isTransient(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true
    return this.status !== null && (this.status >= 500 || this.status === 429)
  }

  get isAuthError(): boolean {
    return this.code === 'UNAUTHENTICATED' || this.code === 'SESSION_EXPIRED'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function hasErrorCode(error: unknown, code: ApiErrorCode): error is ApiError {
  return isApiError(error) && error.code === code
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isCancel(error)) {
    return new ApiError({ kind: 'canceled', message: 'Requisição cancelada.' })
  }
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({
        kind: 'timeout',
        message: 'A operação demorou demais para responder. Tente novamente.',
      })
    }
    if (!error.response) {
      return new ApiError({
        kind: 'network',
        message: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
      })
    }
    const parsed = apiErrorBody.safeParse(error.response.data)
    if (parsed.success) {
      const { code, message, fieldErrors, details } = parsed.data.error
      return new ApiError({
        kind: 'http',
        status: error.response.status,
        code,
        message,
        fieldErrors,
        details,
      })
    }
    return new ApiError({
      kind: 'http',
      status: error.response.status,
      code: error.response.status >= 500 ? 'INTERNAL' : null,
      message: 'Ocorreu um erro inesperado. Tente novamente.',
    })
  }
  return new ApiError({ kind: 'contract', message: 'Resposta inesperada do servidor.' })
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message
}
