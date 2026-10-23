import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateWalletRequest } from '@/api/contracts'
import { walletsApi } from '@/api/endpoints/wallets'
import { queryKeys } from '@/app/query-keys'
import { useCurrentUserId } from '@/features/auth/session'

export function walletsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.wallets(userId),
    queryFn: ({ signal }) => walletsApi.list(signal),
  })
}

export function useWallets() {
  const userId = useCurrentUserId()
  return useQuery({ ...walletsQueryOptions(userId ?? 'anonymous'), enabled: userId !== null })
}

export function useCreateWallet() {
  const queryClient = useQueryClient()
  const userId = useCurrentUserId()
  return useMutation({
    mutationFn: (body: CreateWalletRequest) => walletsApi.create(body),
    onSettled: () =>
      userId
        ? queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets(userId) })
        : undefined,
  })
}
