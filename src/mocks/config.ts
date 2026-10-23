import { env } from '@/env'

export const apiBase = env.VITE_API_BASE_URL.replace(/\/$/, '')

export function apiPath(path: string) {
  return `${apiBase}${path}`
}

export const socketHttpUrl = env.VITE_SOCKET_URL.replace(/\/$/, '')
export const socketWsUrl = socketHttpUrl.replace(/^http/, 'ws')

export const fixtureNow = Date.parse('2026-07-29T12:00:00.000Z')
export const sessionTtlMs = 30 * 60_000
export const quoteTtlMs = 5 * 60_000
export const defaultSettleDelayMs = 2_500
