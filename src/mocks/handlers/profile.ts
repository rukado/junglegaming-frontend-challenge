import { http, HttpResponse } from 'msw'
import {
  changePasswordRequest,
  maxAvatarBytes,
  updateAvatarRequest,
  updateProfileRequest,
} from '@/api/contracts'
import { apiPath } from '../config'
import { hashPassword, randomToken } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import type { UserRecord } from '../db/types'
import { authenticate, toPublicUser } from '../domain/auth'
import { apiError, readJson, withNetwork } from '../network'
import { validationError } from './validation'

function patchUser(userId: string, update: (user: UserRecord) => void) {
  return mutate((db) => {
    const user = db.users.find((candidate) => candidate.id === userId)
    if (!user) throw new Error('User not found')
    update(user)
    user.version += 1
    return user
  })
}

export const profileHandlers = [
  http.get(
    apiPath('/profile'),
    withNetwork('profile', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      return HttpResponse.json(toPublicUser(auth.user))
    }),
  ),
  http.patch(
    apiPath('/profile'),
    withNetwork('profile', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = updateProfileRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const body = parsed.data
      if (body.version !== auth.user.version) {
        return apiError(
          409,
          'CONFLICT',
          'Seu perfil foi alterado em outra sessão. Recarregue os dados antes de salvar.',
          {
            details: { currentVersion: auth.user.version },
          },
        )
      }
      const others = getDb().users.filter((user) => user.id !== auth.user.id)
      const fieldErrors: Record<string, string> = {}
      if (others.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
        fieldErrors.email = 'Este e-mail já está em uso.'
      }
      if (others.some((user) => user.username === body.username)) {
        fieldErrors.username = 'Este nome de usuário já está em uso.'
      }
      if (Object.keys(fieldErrors).length > 0) {
        return apiError(409, 'CONFLICT', 'Alguns dados já pertencem a outra conta.', {
          fieldErrors,
        })
      }
      const updated = patchUser(auth.user.id, (user) => {
        user.displayName = body.displayName
        user.username = body.username
        user.email = body.email
        user.ens = body.ens
        user.walletNickname = body.walletNickname
      })
      return HttpResponse.json(toPublicUser(updated))
    }),
  ),
  http.put(
    apiPath('/profile/avatar'),
    withNetwork('profile', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = updateAvatarRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const base64 = parsed.data.dataUrl.split(',')[1] ?? ''
      const bytes = Math.floor((base64.length * 3) / 4)
      if (bytes > maxAvatarBytes) {
        return apiError(413, 'VALIDATION_ERROR', 'A imagem deve ter no máximo 1 MB.', {
          fieldErrors: { avatar: 'A imagem deve ter no máximo 1 MB.' },
        })
      }
      const updated = patchUser(auth.user.id, (user) => {
        user.avatarUrl = parsed.data.dataUrl
      })
      return HttpResponse.json(toPublicUser(updated))
    }),
  ),
  http.delete(
    apiPath('/profile/avatar'),
    withNetwork('profile', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const updated = patchUser(auth.user.id, (user) => {
        user.avatarUrl = null
      })
      return HttpResponse.json(toPublicUser(updated))
    }),
  ),
  http.post(
    apiPath('/profile/password'),
    withNetwork('profile', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = changePasswordRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const currentHash = await hashPassword(parsed.data.currentPassword, auth.user.passwordSalt)
      if (currentHash !== auth.user.passwordHash) {
        return apiError(422, 'VALIDATION_ERROR', 'A senha atual está incorreta.', {
          fieldErrors: { currentPassword: 'A senha atual está incorreta.' },
        })
      }
      if (parsed.data.currentPassword === parsed.data.newPassword) {
        return apiError(422, 'VALIDATION_ERROR', 'A nova senha deve ser diferente da atual.', {
          fieldErrors: { newPassword: 'A nova senha deve ser diferente da atual.' },
        })
      }
      const salt = randomToken(8)
      const hash = await hashPassword(parsed.data.newPassword, salt)
      patchUser(auth.user.id, (user) => {
        user.passwordSalt = salt
        user.passwordHash = hash
      })
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
