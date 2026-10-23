import { session, type LoginRequest, type RegisterRequest } from '../contracts'
import { request, requestVoid } from '../http'

export const authApi = {
  login: (body: LoginRequest) =>
    request(session, { method: 'POST', url: '/auth/login', data: body }),
  register: (body: RegisterRequest) =>
    request(session, { method: 'POST', url: '/auth/register', data: body }),
  session: (signal?: AbortSignal) =>
    request(session, { method: 'GET', url: '/auth/session', signal }),
  logout: () => requestVoid({ method: 'POST', url: '/auth/logout' }),
}
