import { http, HttpResponse } from 'msw'
import { loginRequest, registerRequest } from '@/api/contracts'
import { apiPath } from '../config'
import { hashPassword, randomToken } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import { authenticate, bearerToken, createSession, toPublicUser } from '../domain/auth'
import { apiError, readJson, withNetwork } from '../network'
import { dropConnectionsForToken } from '../realtime/server'
import { validationError } from './validation'

export const authHandlers = [
  http.post(
    apiPath('/auth/login'),
    withNetwork('auth', async ({ request }) => {
      const parsed = loginRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const email = parsed.data.email.toLowerCase()
      const user = getDb().users.find((candidate) => candidate.email.toLowerCase() === email)
      const hash = user ? await hashPassword(parsed.data.password, user.passwordSalt) : null
      if (!user || hash !== user.passwordHash) {
        return apiError(401, 'UNAUTHENTICATED', 'E-mail ou senha incorretos.')
      }
      return HttpResponse.json(createSession(user.id))
    }),
  ),
  http.post(
    apiPath('/auth/register'),
    withNetwork('auth', async ({ request }) => {
      const parsed = registerRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const { email, username, password } = parsed.data
      const db = getDb()
      const fieldErrors: Record<string, string> = {}
      if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        fieldErrors.email = 'Este e-mail já está cadastrado.'
      }
      if (db.users.some((user) => user.username === username)) {
        fieldErrors.username = 'Este nome de usuário já está em uso.'
      }
      if (Object.keys(fieldErrors).length > 0) {
        return apiError(409, 'CONFLICT', 'Já existe uma conta com esses dados.', { fieldErrors })
      }
      const salt = randomToken(8)
      const id = `user_${randomToken(6)}`
      const passwordHash = await hashPassword(password, salt)
      mutate((state) => {
        state.users.push({
          id,
          email,
          displayName: username,
          username,
          ens: null,
          walletNickname: null,
          avatarUrl: null,
          createdAt: new Date().toISOString(),
          version: 1,
          passwordSalt: salt,
          passwordHash,
        })
        state.wallets[id] = []
        state.favorites[id] = []
      })
      return HttpResponse.json(createSession(id), { status: 201 })
    }),
  ),
  http.get(
    apiPath('/auth/session'),
    withNetwork('auth', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const session = getDb().sessions.find((candidate) => candidate.token === auth.token)
      return HttpResponse.json({
        token: auth.token,
        expiresAt: new Date(session?.expiresAt ?? Date.now()).toISOString(),
        user: toPublicUser(auth.user),
      })
    }),
  ),
  http.post(
    apiPath('/auth/logout'),
    withNetwork('auth', ({ request }) => {
      const token = bearerToken(request)
      if (token) {
        dropConnectionsForToken(token)
        mutate((state) => {
          state.sessions = state.sessions.filter((session) => session.token !== token)
        })
      }
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
