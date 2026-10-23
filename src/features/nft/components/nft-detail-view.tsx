import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { NftDetail } from '@/api/contracts'
import { categoryLabels } from '@/api/contracts'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { formatEthAmount } from '@/lib/format'
import { pickDefaultEdition } from '../editions'
import { EditionPicker } from './edition-picker'
import { NftGallery } from './nft-gallery'
import { NftPurchase } from './nft-purchase'
import { RatingStars } from './rating-stars'
import { ShareLinks } from './share-links'

type NftDetailViewProps = {
  nft: NftDetail
  editionId: string | undefined
  onEditionChange: (editionId: string) => void
}

export function NftDetailView({ nft, editionId, onEditionChange }: NftDetailViewProps) {
  const router = useRouter()
  const edition = pickDefaultEdition(nft, editionId)
  const shareUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/nft/${nft.id}`

  return (
    <article aria-labelledby="nft-title" className="pb-60 md:pb-0">
      <div className="relative md:hidden">
        <div className="absolute inset-x-7 top-6 z-10 flex justify-between">
          <button
            type="button"
            onClick={() =>
              window.history.length > 1 ? router.history.back() : void router.navigate({ to: '/' })
            }
            aria-label="Voltar"
            className="flex size-[35px] items-center justify-center rounded-full bg-surface-card/90 text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <FavoriteButton nftId={nft.id} name={nft.name} />
        </div>
        <div className="bg-surface-card px-7 pt-[66px] pb-16">
          <NftGallery images={nft.gallery} name={nft.name} />
        </div>
      </div>

      <div className="container-page relative -mt-6 rounded-t-[30px] bg-ink pt-8 md:mt-0 md:rounded-none md:pt-6">
        <nav
          aria-label="Trilha de navegação"
          className="mb-3 hidden text-body font-bold text-foreground md:block"
        >
          <ol className="flex gap-1">
            <li>
              <Link to="/" className="hover:text-text-accent">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/" hash="catalogo" className="hover:text-text-accent">
                Mercado
              </Link>
            </li>
          </ol>
        </nav>
        <div className="flex flex-col gap-8 md:flex-row md:gap-8">
          <div className="hidden md:block">
            <NftGallery images={nft.gallery} name={nft.name} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <header className="flex flex-col gap-3 md:border-b md:border-border md:pb-3">
              <div className="flex items-center justify-between gap-3">
                <h1
                  id="nft-title"
                  className="text-lead font-bold text-foreground md:text-[32px] md:leading-[37px]"
                >
                  {nft.name}
                </h1>
                <div className="md:hidden">
                  <RatingStars average={nft.rating.average} count={nft.rating.count} compact />
                </div>
              </div>
              <div className="hidden items-center justify-between gap-4 md:flex">
                <p className="text-lead font-bold text-text-accent" aria-live="polite">
                  {formatEthAmount(edition.priceEth)}
                </p>
                <RatingStars average={nft.rating.average} count={nft.rating.count} />
              </div>
            </header>
            <section aria-labelledby="about-title" className="flex flex-col gap-3">
              <h2 id="about-title" className="hidden text-body font-bold text-foreground md:block">
                Sobre este NFT:
              </h2>
              <p className="text-body leading-[22px] text-text-secondary">{nft.description}</p>
            </section>
            <EditionPicker
              editions={nft.editions}
              selectedId={edition.id}
              onSelect={onEditionChange}
            />
            <NftPurchase nft={nft} edition={edition} />
            <dl className="flex flex-col gap-3 text-[15px] leading-5 text-text-secondary">
              <div className="flex gap-1">
                <dt>ID do token:</dt>
                <dd>{nft.tokenId}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Coleção:</dt>
                <dd>{nft.collection.name}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Categoria:</dt>
                <dd>{categoryLabels[nft.category]}</dd>
              </div>
              <div className="flex gap-1">
                <dt>Atributos:</dt>
                <dd>{nft.attributes.join(', ')}</dd>
              </div>
            </dl>
            <ShareLinks name={nft.name} url={shareUrl} />
          </div>
        </div>
      </div>
    </article>
  )
}
