import { create, isAxiosError, type AxiosRequestConfig } from 'axios'
import type { z } from 'zod'
import { env } from '@/env'
import { getGuestCartId } from '@/features/cart/guest-cart'
import { sessionStore } from '@/features/auth/session-store'
import { ApiError, toApiError } from './errors'

export const http = create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json' },
  paramsSerializer: { indexes: null },
})

http.interceptors.request.use((config) => {
  const token = sessionStore.getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  config.headers.set('X-Cart-Id', getGuestCartId())
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    const sentToken = isAxiosError(error) && Boolean(error.config?.headers?.Authorization)
    if (sentToken && apiError.status === 401 && apiError.isAuthError) {
      sessionStore.end('expired')
    }
    return Promise.reject(apiError)
  },
)

export async function request<T extends z.ZodType>(
  schema: T,
  config: AxiosRequestConfig,
): Promise<z.infer<T>> {
  const response = await http.request<unknown>(config)
  const parsed = schema.safeParse(response.data)
  if (!parsed.success) {
    throw new ApiError({
      kind: 'contract',
      status: response.status,
      message: 'Resposta inesperada do servidor.',
      details: { issues: parsed.error.issues },
    })
  }
  return parsed.data
}

export async function requestVoid(config: AxiosRequestConfig): Promise<void> {
  await http.request(config)
}
