import { Link } from '@tanstack/react-router'

export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="container-page pt-8">
      <div className="flex flex-col-reverse items-center gap-8 lg:h-[450px] lg:flex-row lg:justify-between lg:gap-10 lg:pl-10">
        <div className="flex w-full flex-col items-start gap-8 lg:w-[600px] lg:items-end lg:gap-11">
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full flex-col gap-1">
              <div className="flex flex-col gap-2 text-foreground">
                <p className="text-body leading-4 font-medium tracking-[1.4px]">
                  Bem-vindo à Kurio
                </p>
                <h1
                  id="hero-title"
                  className="text-[28px] leading-[44px] font-bold md:text-display md:leading-[70px]"
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
            <Link
              to="/"
              hash="catalogo"
              className="inline-flex h-10 w-[140px] items-center justify-center rounded-md bg-primary text-body-lg font-bold text-ink transition-colors hover:bg-text-accent"
            >
              EXPLORAR
            </Link>
          </div>
        </div>
        <img
          src="/images/hero-900.webp"
          srcSet="/images/hero-450.webp 450w, /images/hero-900.webp 900w"
          sizes="(min-width: 1024px) 450px, calc(100vw - 2rem)"
          width={450}
          height={450}
          alt="Ilustração de um macaco de óculos redondos e jaqueta verde, NFT em destaque"
          fetchPriority="high"
          className="aspect-square w-full max-w-[450px] shrink-0 rounded-2xl object-cover"
        />
      </div>
    </section>
  )
}
