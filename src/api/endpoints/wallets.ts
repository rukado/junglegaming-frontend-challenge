import {
  wallet,
  walletConnection,
  walletList,
  type ConnectWalletRequest,
  type CreateWalletRequest,
  type UpdateWalletRequest,
} from '../contracts'
import { request } from '../http'

export const walletsApi = {
  list: (signal?: AbortSignal) => request(walletList, { method: 'GET', url: '/wallets', signal }),
  create: (body: CreateWalletRequest) =>
    request(wallet, { method: 'POST', url: '/wallets', data: body }),
  update: (walletId: string, body: UpdateWalletRequest) =>
    request(wallet, { method: 'PUT', url: `/wallets/${encodeURIComponent(walletId)}`, data: body }),
  connect: (body: ConnectWalletRequest) =>
    request(walletConnection, { method: 'POST', url: '/wallet-connections', data: body }),
  disconnect: (connectionId: string) =>
    request(walletConnection, {
      method: 'DELETE',
      url: `/wallet-connections/${encodeURIComponent(connectionId)}`,
    }),
}
