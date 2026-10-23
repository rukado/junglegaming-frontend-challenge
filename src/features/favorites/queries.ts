import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { FavoritesResponse } from '@/api/contracts'
import { favoritesApi } from '@/api/endpoints/favorites'
import { errorMessage } from '@/api/errors'
import { queryKeys } from '@/app/query-keys'
import { useSession } from '@/features/auth/session'

export function favoritesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.favorites(userId),
    queryFn: ({ signal }) => favoritesApi.list(signal),
  })
}

export function useFavorites() {
  const session = useSession()
  const userId = session.status === 'authenticated' ? session.user.id : null
  const query = useQuery({
    ...favoritesQueryOptions(userId ?? 'anonymous'),
    enabled: userId !== null,
  })
  return { userId, query, ids: new Set(query.data?.nftIds ?? []) }
}

type ToggleVariables = { nftId: string; favorite: boolean; name: string }

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const { userId } = useFavorites()
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })

  const mutation = useMutation({
    mutationKey: ['favorites', 'toggle'],
    mutationFn: ({ nftId, favorite }: ToggleVariables) =>
      favorite ? favoritesApi.add(nftId) : favoritesApi.remove(nftId),
    onMutate: async ({ nftId, favorite }) => {
      if (!userId) return { previous: undefined }
      const key = queryKeys.user.favorites(userId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FavoritesResponse>(key)
      queryClient.setQueryData<FavoritesResponse>(key, (current) => {
        const base = current ?? { nftIds: [], items: [] }
        const nftIds = favorite
          ? Array.from(new Set([...base.nftIds, nftId]))
          : base.nftIds.filter((id) => id !== nftId)
        return { nftIds, items: base.items.filter((item) => nftIds.includes(item.id)) }
      })
      return { previous }
    },
    onError: (error, { name, favorite }, context) => {
      if (userId && context?.previous)
        queryClient.setQueryData(queryKeys.user.favorites(userId), context.previous)
      toast.error(
        `Não foi possível ${favorite ? 'favoritar' : 'remover dos favoritos'} ${name}. ${errorMessage(error)}`,
      )
    },
    onSuccess: (data, { name, favorite }) => {
      if (userId) queryClient.setQueryData(queryKeys.user.favorites(userId), data)
      toast.success(
        favorite ? `${name} adicionado aos favoritos.` : `${name} removido dos favoritos.`,
      )
    },
    onSettled: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites(userId) })
    },
  })

  function toggle(variables: ToggleVariables) {
    if (!userId) {
      void navigate({ to: '/login', search: { redirect: href, reason: 'required' } })
      return
    }
    mutation.mutate(variables)
  }

  return { toggle, isPending: mutation.isPending }
}
