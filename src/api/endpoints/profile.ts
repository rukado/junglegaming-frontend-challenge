import {
  profile,
  type ChangePasswordRequest,
  type UpdateAvatarRequest,
  type UpdateProfileRequest,
} from '../contracts'
import { request, requestVoid } from '../http'

export const profileApi = {
  get: (signal?: AbortSignal) => request(profile, { method: 'GET', url: '/profile', signal }),
  update: (body: UpdateProfileRequest) =>
    request(profile, { method: 'PATCH', url: '/profile', data: body }),
  updateAvatar: (body: UpdateAvatarRequest) =>
    request(profile, { method: 'PUT', url: '/profile/avatar', data: body }),
  removeAvatar: () => request(profile, { method: 'DELETE', url: '/profile/avatar' }),
  changePassword: (body: ChangePasswordRequest) =>
    requestVoid({ method: 'POST', url: '/profile/password', data: body }),
}
