import { Link } from '@tanstack/react-router'
import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'

const promos = [
  {
    id: 'genesis',
    title: ['Lançamentos gênesis', 'de edição limitada'],
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: '/nfts/emerald-640.webp',
    search: { tab: 'new' as const },
  },
  {
    id: 'curated',
    title: ['Arte digital selecionada', 'e muito mais'],
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    image: '/nfts/baron-640.webp',
    search: { categories: ['arte-digital' as const] },
  },
]

export function PromoCards() {
  return (
    <section aria-label="Promoções" className="container-page mt-16 md:mt-24">
      <ul className="grid gap-6 lg:grid-cols-2">
        {promos.map((promo) => (
          <li
            key={promo.id}
            className="relative flex h-[250px] overflow-hidden rounded-lg bg-surface-card"
          >
            <img
              src={promo.image}
              width={292}
              height={250}
              alt=""
              loading="lazy"
              className="h-full w-[42%] max-w-[292px] shrink-0 rounded-[18px] object-cover sm:w-[50%]"
            />
            <img
              src={icons.promoCurves}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
            <div className="relative flex min-w-0 flex-1 flex-col items-end justify-center gap-3 px-4 text-right sm:px-[30px]">
              <h2 className="text-body-lg leading-6 font-bold text-foreground sm:text-lead">
                {promo.title[0]}
                <br />
                {promo.title[1]}
              </h2>
              <p className="max-w-[263px] text-caption leading-5 text-text-secondary sm:text-body sm:leading-6">
                {promo.text}
              </p>
              <Link
                to="/"
                search={promo.search}
                hash="catalogo"
                className="mt-1 inline-flex h-10 w-[140px] items-center justify-center gap-2 rounded-md bg-primary text-body leading-5 font-medium text-ink transition-colors hover:bg-text-accent"
              >
                Explorar
                <MaskIcon
                  src={icons.arrowRight}
                  className="h-[13px] w-[11px] -rotate-90 text-ink"
                />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
