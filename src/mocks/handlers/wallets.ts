import { http, HttpResponse } from 'msw'
import { connectWalletRequest, createWalletRequest, updateWalletRequest } from '@/api/contracts'
import { apiPath } from '../config'
import { randomToken } from '../db/crypto'
import { getDb, mutate } from '../db/store'
import { authenticate } from '../domain/auth'
import { apiError, readJson, withNetwork } from '../network'
import { getScenario } from '../scenarios'
import { validationError } from './validation'

export const walletHandlers = [
  http.get(
    apiPath('/wallets'),
    withNetwork('wallets', ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      return HttpResponse.json({ items: getDb().wallets[auth.user.id] ?? [] })
    }),
  ),
  http.post(
    apiPath('/wallets'),
    withNetwork('wallets', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = createWalletRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const current = getDb().wallets[auth.user.id] ?? []
      if (current.some((wallet) => wallet.slot === parsed.data.slot)) {
        return apiError(409, 'CONFLICT', 'Já existe uma carteira cadastrada nesta posição.')
      }
      if (
        current.some((wallet) => wallet.address.toLowerCase() === parsed.data.address.toLowerCase())
      ) {
        return apiError(409, 'CONFLICT', 'Este endereço já está cadastrado.', {
          fieldErrors: { address: 'Este endereço já está cadastrado.' },
        })
      }
      const wallet = {
        ...parsed.data,
        id: `wallet_${randomToken(6)}`,
        updatedAt: new Date().toISOString(),
        version: 1,
      }
      mutate((db) => {
        db.wallets[auth.user.id] = [...(db.wallets[auth.user.id] ?? []), wallet]
      })
      return HttpResponse.json(wallet, { status: 201 })
    }),
  ),
  http.put(
    apiPath('/wallets/:walletId'),
    withNetwork('wallets', async ({ request, params }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = updateWalletRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const current = getDb().wallets[auth.user.id] ?? []
      const existing = current.find((wallet) => wallet.id === params.walletId)
      if (!existing) return apiError(404, 'NOT_FOUND', 'Carteira não encontrada.')
      if (existing.version !== parsed.data.version) {
        return apiError(
          409,
          'CONFLICT',
          'Esta carteira foi alterada em outra sessão. Recarregue antes de salvar.',
        )
      }
      if (
        current.some(
          (wallet) =>
            wallet.id !== existing.id &&
            wallet.address.toLowerCase() === parsed.data.address.toLowerCase(),
        )
      ) {
        return apiError(409, 'CONFLICT', 'Este endereço já está cadastrado.', {
          fieldErrors: { address: 'Este endereço já está cadastrado.' },
        })
      }
      const { version: _version, ...fields } = parsed.data
      const updated = {
        ...existing,
        ...fields,
        updatedAt: new Date().toISOString(),
        version: existing.version + 1,
      }
      mutate((db) => {
        db.wallets[auth.user.id] = (db.wallets[auth.user.id] ?? []).map((wallet) =>
          wallet.id === updated.id ? updated : wallet,
        )
      })
      return HttpResponse.json(updated)
    }),
  ),
  http.post(
    apiPath('/wallet-connections'),
    withNetwork('wallets', async ({ request }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const parsed = connectWalletRequest.safeParse(await readJson(request))
      if (!parsed.success) return validationError(parsed.error)
      const wallet = (getDb().wallets[auth.user.id] ?? []).find(
        (candidate) => candidate.id === parsed.data.walletId,
      )
      if (!wallet) return apiError(404, 'NOT_FOUND', 'Carteira não encontrada.')
      const scenario = getScenario()
      if (scenario.walletRejects) {
        return apiError(403, 'WALLET_REJECTED', 'A conexão foi recusada na carteira.')
      }
      const connection = {
        id: `conn_${randomToken(6)}`,
        walletId: wallet.id,
        network: parsed.data.network,
        address: wallet.address,
        status: 'connected' as const,
        connectedAt: new Date().toISOString(),
        userId: auth.user.id,
      }
      mutate((db) => {
        db.connections = [
          ...db.connections.filter(
            (item) => item.userId !== auth.user.id || item.status === 'connected',
          ),
          connection,
        ]
      })
      if (scenario.walletDisconnectsAfterMs) {
        setTimeout(() => {
          mutate((db) => {
            const target = db.connections.find((item) => item.id === connection.id)
            if (target) target.status = 'disconnected'
          })
        }, scenario.walletDisconnectsAfterMs)
      }
      const { userId: _userId, ...response } = connection
      return HttpResponse.json(response, { status: 201 })
    }),
  ),
  http.delete(
    apiPath('/wallet-connections/:connectionId'),
    withNetwork('wallets', ({ request, params }) => {
      const auth = authenticate(request)
      if (!auth.ok) return auth.response
      const target = getDb().connections.find(
        (item) => item.id === params.connectionId && item.userId === auth.user.id,
      )
      if (!target) return apiError(404, 'NOT_FOUND', 'Conexão não encontrada.')
      const updated = mutate((db) => {
        const connection = db.connections.find((item) => item.id === target.id)
        if (connection) connection.status = 'disconnected'
        return connection ?? target
      })
      const { userId: _userId, ...response } = updated
      return HttpResponse.json(response)
    }),
  ),
]
