import { ComingSoon } from '@/components/common/coming-soon'

const posts = [
  {
    date: '12 de setembro',
    reading: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    text: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: '/nfts/baron-320.webp',
  },
  {
    date: '13 de setembro',
    reading: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    text: 'Conheça criadores que moldam a cultura digital.',
    image: '/nfts/emerald-320.webp',
  },
  {
    date: '15 de setembro',
    reading: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    text: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: '/nfts/nomad-320.webp',
  },
  {
    date: '15 de setembro',
    reading: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    text: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: '/nfts/golden-320.webp',
  },
]

export function BlogSection() {
  return (
    <section
      aria-labelledby="blog-title"
      className="container-page mt-16 flex flex-col items-center gap-10 md:mt-24"
    >
      <header className="flex flex-col gap-3 text-center">
        <h2 id="blog-title" className="text-[28px] font-bold text-[#f7f3ec]">
          Diário da Cunhagem
        </h2>
        <p className="text-body text-text-secondary">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>
      <ul className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.title} className="flex flex-col overflow-hidden rounded-lg bg-surface-card">
            <img
              src={post.image}
              width={268}
              height={195}
              alt=""
              loading="lazy"
              className="h-[195px] w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
              <p className="text-caption leading-4 font-medium whitespace-pre-wrap text-text-secondary">
                {`${post.date}  |  ${post.reading}`}
              </p>
              <h3 className="text-body-lg font-bold text-[#f7f3ec]">{post.title}</h3>
              <p className="text-caption leading-4 font-medium text-text-secondary">{post.text}</p>
              <ComingSoon className="mt-auto text-caption leading-[14px] font-bold text-text-accent">
                Ler mais →
              </ComingSoon>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
