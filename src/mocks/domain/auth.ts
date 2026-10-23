import type { Session, User } from '@/api/contracts'
import { sessionTtlMs } from '../config'
import { randomToken } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import type { UserRecord } from '../db/types'
import { apiError } from '../network'
import { getRuntime, getScenario } from '../scenarios'

export function toPublicUser(record: UserRecord): User {
  const { passwordHash: _hash, passwordSalt: _salt, ...user } = record
  return user
}

export function createSession(userId: string): Session {
  const user = getDb().users.find((candidate) => candidate.id === userId)
  if (!user) throw new Error('User not found')
  const token = randomToken()
  const expiresAt = Date.now() + sessionTtlMs
  mutate((db) => {
    db.sessions = db.sessions.filter((session) => session.expiresAt > Date.now())
    db.sessions.push({ token, userId, expiresAt })
  })
  return { token, expiresAt: new Date(expiresAt).toISOString(), user: toPublicUser(user) }
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

export type AuthResult =
  { ok: true; user: UserRecord; token: string } | { ok: false; response: Response }

export function authenticate(request: Request): AuthResult {
  const token = bearerToken(request)
  if (!token) {
    return { ok: false, response: apiError(401, 'UNAUTHENTICATED', 'Faça login para continuar.') }
  }
  const db = getDb()
  const session = db.sessions.find((candidate) => candidate.token === token)
  if (!session) {
    return {
      ok: false,
      response: apiError(401, 'UNAUTHENTICATED', 'Sua sessão não é mais válida. Entre novamente.'),
    }
  }
  const runtime = getRuntime()
  const forceExpire = getScenario().expireSessionOnce && !runtime.sessionExpiredFired
  if (forceExpire || session.expiresAt <= Date.now()) {
    runtime.sessionExpiredFired = true
    mutate((state) => {
      state.sessions = state.sessions.filter((candidate) => candidate.token !== token)
    })
    return {
      ok: false,
      response: apiError(
        401,
        'SESSION_EXPIRED',
        'Sua sessão expirou. Entre novamente para continuar.',
      ),
    }
  }
  const user = db.users.find((candidate) => candidate.id === session.userId)
  if (!user) {
    return {
      ok: false,
      response: apiError(401, 'UNAUTHENTICATED', 'Sua sessão não é mais válida. Entre novamente.'),
    }
  }
  return { ok: true, user, token }
}

export function optionalUser(request: Request): UserRecord | null {
  const token = bearerToken(request)
  if (!token) return null
  const db = getDb()
  const session = db.sessions.find(
    (candidate) => candidate.token === token && candidate.expiresAt > Date.now(),
  )
  if (!session) return null
  return db.users.find((candidate) => candidate.id === session.userId) ?? null
}
