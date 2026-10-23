import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ChangePasswordRequest,
  Profile,
  Session,
  UpdateAvatarRequest,
  UpdateProfileRequest,
} from '@/api/contracts'
import { profileApi } from '@/api/endpoints/profile'
import { queryKeys } from '@/app/query-keys'
import { sessionStore } from '@/features/auth/session-store'

function useWriteProfile() {
  const queryClient = useQueryClient()
  return (profile: Profile) => {
    queryClient.setQueryData<Session>(queryKeys.session(sessionStore.getToken()), (current) =>
      current ? { ...current, user: profile } : current,
    )
    queryClient.setQueryData(queryKeys.user.profile(profile.id), profile)
  }
}

export function useUpdateProfile() {
  const write = useWriteProfile()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => profileApi.update(body),
    onSuccess: write,
  })
}

export function useUpdateAvatar() {
  const write = useWriteProfile()
  return useMutation({
    mutationFn: (body: UpdateAvatarRequest) => profileApi.updateAvatar(body),
    onSuccess: write,
  })
}

export function useRemoveAvatar() {
  const write = useWriteProfile()
  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: write,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => profileApi.changePassword(body),
  })
}
