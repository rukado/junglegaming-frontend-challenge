import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { featuredQueryOptions } from '../queries'

type HomeHeroProps = {
  onExplore: () => void
}

const staticSlide = {
  id: 'emerald-ape-042',
  name: 'Emerald Ape #042',
  alt: 'Emerald Ape #042: macaco de óculos redondos e jaqueta verde de colégio',
}

export function HomeHero({ onExplore }: HomeHeroProps) {
  const { data } = useQuery(featuredQueryOptions())
  const slides = data?.items.length ? data.items : null
  const [index, setIndex] = useState(0)
  const current = slides?.[index] ?? null
  const showStatic = !current || index === 0

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carrossel"
      className="container-page hidden pt-8 md:block"
    >
      <div className="flex items-center justify-between gap-10 lg:h-[450px] lg:pl-10">
        <div className="flex w-full max-w-[600px] flex-col items-start gap-8 lg:items-end lg:gap-11">
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full flex-col gap-1">
              <div className="flex flex-col gap-2 text-foreground">
                <p className="text-body leading-4 font-medium tracking-[1.4px]">
                  Bem-vindo à Kurio
                </p>
                <h1
                  id="hero-title"
                  className="text-[34px] leading-[56px] font-bold lg:text-display lg:leading-[70px]"
                >
                  SEJA DONO DO FUTURO
                  <br />
                  DA ARTE DIGITAL
                </h1>
              </div>
              <p className="max-w-[557px] text-body leading-6 text-text-secondary">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex h-10 w-[140px] items-center justify-center rounded-md bg-primary text-body-lg font-bold text-ink transition-colors hover:bg-text-accent"
            >
              EXPLORAR
            </button>
          </div>
          {slides && slides.length > 1 && (
            <fieldset className="flex items-center gap-2">
              <legend className="sr-only">Destaques</legend>
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Mostrar destaque ${slideIndex + 1} de ${slides.length}: ${slide.name}`}
                  aria-current={slideIndex === index ? 'true' : undefined}
                  onClick={() => setIndex(slideIndex)}
                  className="flex size-6 items-center justify-center rounded-full"
                >
                  <span
                    className={cn(
                      'block size-2 rounded-full border border-primary transition-colors',
                      slideIndex === index ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                </button>
              ))}
            </fieldset>
          )}
        </div>
        <Link
          to="/nft/$nftId"
          params={{ nftId: current?.id ?? staticSlide.id }}
          aria-live="polite"
          className="block w-[45%] max-w-[450px] shrink-0 rounded-2xl"
        >
          {showStatic ? (
            <img
              src="/images/hero-900.webp"
              srcSet="/images/hero-450.webp 450w, /images/hero-900.webp 900w"
              sizes="450px"
              width={450}
              height={450}
              alt={staticSlide.alt}
              fetchPriority="high"
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ) : (
            <img
              src={current.image.lg}
              width={450}
              height={450}
              alt={current.image.alt}
              className="aspect-square w-full rounded-2xl object-cover"
            />
          )}
          <span className="sr-only">Ver {current?.name ?? staticSlide.name}</span>
        </Link>
      </div>
    </section>
  )
}
