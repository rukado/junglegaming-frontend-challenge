import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Edition, NftDetail } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { useAddToCart, useCart } from '@/features/cart/queries'

export function usePurchase(nft: NftDetail, edition: Edition | undefined) {
  const navigate = useNavigate()
  const { query: cartQuery } = useCart()
  const addToCart = useAddToCart()
  const [quantity, setQuantity] = useState(1)
  const [editionKey, setEditionKey] = useState(edition?.id)

  if (edition?.id !== editionKey) {
    setEditionKey(edition?.id)
    setQuantity(1)
  }

  const inCart = cartQuery.data?.items.find((item) => item.editionId === edition?.id)?.quantity ?? 0
  const limit = edition ? Math.max(0, Math.min(edition.available, edition.maxPerOrder) - inCart) : 0
  const soldOut = !edition || edition.available === 0
  const unavailable = soldOut || limit === 0
  const safeQuantity = Math.min(Math.max(1, quantity), Math.max(1, limit))

  let availabilityMessage: string
  if (!edition) availabilityMessage = 'Selecione uma edição.'
  else if (edition.available === 0) availabilityMessage = 'Esta edição está esgotada.'
  else if (limit === 0)
    availabilityMessage = `Você já tem o máximo permitido desta edição no carrinho (${inCart}).`
  else if (edition.supply === null)
    availabilityMessage = `Edição aberta · máximo de ${edition.maxPerOrder} por pedido.`
  else
    availabilityMessage = `${edition.available} de ${edition.supply} disponíveis · máximo de ${edition.maxPerOrder} por pedido${inCart ? ` · ${inCart} no carrinho` : ''}.`

  async function add(goToCart: boolean) {
    if (!edition || unavailable) return
    try {
      await addToCart.mutateAsync({ nftId: nft.id, editionId: edition.id, quantity: safeQuantity })
      if (goToCart) {
        await navigate({ to: '/cart' })
      } else {
        toast.success(`${nft.name} (${safeQuantity}×) adicionado ao carrinho.`, {
          action: { label: 'Ver carrinho', onClick: () => void navigate({ to: '/cart' }) },
        })
      }
      setQuantity(1)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return {
    quantity: safeQuantity,
    setQuantity,
    limit,
    inCart,
    unavailable,
    soldOut,
    availabilityMessage,
    pending: addToCart.isPending,
    buyNow: () => add(true),
    addOnly: () => add(false),
  }
}
