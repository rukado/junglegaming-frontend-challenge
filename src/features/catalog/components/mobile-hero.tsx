import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'

type MobileHeroProps = {
  onExplore: () => void
}

export function MobileHero({ onExplore }: MobileHeroProps) {
  return (
    <section
      aria-labelledby="mobile-hero-title"
      className="relative overflow-hidden rounded-[30px] p-4 md:hidden"
    >
      <img
        src={icons.heroMobileCurves}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="relative flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <p className="text-caption leading-4 font-medium text-foreground">Bem-vindo à Kurio</p>
          <h1
            id="mobile-hero-title"
            className="w-[190px] text-lead leading-[29px] font-bold text-foreground"
          >
            SEJA DONO DA CULTURA DIGITAL
          </h1>
          <p className="text-caption leading-[18px] text-text-secondary">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="mt-1 inline-flex min-h-6 items-center gap-2 text-caption leading-[14px] font-bold text-text-accent"
          >
            EXPLORAR
            <MaskIcon src={icons.arrowRight} className="h-2.5 w-3 -rotate-90 text-text-accent" />
          </button>
        </div>
        <div className="relative size-[138px] shrink-0">
          <img
            src="/images/hero-450.webp"
            width={138}
            height={138}
            alt="Emerald Ape #042, NFT em destaque"
            fetchPriority="high"
            className="size-[138px] rounded-2xl object-cover"
          />
          <img
            src="/nfts/nomad-160.webp"
            width={58}
            height={58}
            alt=""
            aria-hidden="true"
            className="absolute top-[88px] left-[14px] size-[58px] rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
