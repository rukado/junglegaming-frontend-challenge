import { Link } from '@tanstack/react-router'
import { categoryLabels, type CategoryId } from '@/api/contracts'
import { ComingSoon } from '@/components/common/coming-soon'
import { icons } from '@/components/common/icons'
import { NewsletterForm } from './newsletter-form'

const features = [
  {
    letter: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    letter: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    letter: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const footerCategories: CategoryId[] = [
  'arte-digital',
  'fotografia',
  'musica',
  'arte-3d',
  'utilidade',
]

const socials = [
  { name: 'Facebook', icon: icons.socialFacebook },
  { name: 'Instagram', icon: icons.socialInstagram },
  { name: 'X (Twitter)', icon: icons.socialTwitter },
  { name: 'LinkedIn', icon: icons.socialLinkedin },
  { name: 'YouTube', icon: icons.socialYoutube },
]

const linkClass = 'leading-[30px] text-body text-foreground hover:text-text-accent'

export function SiteFooter() {
  return (
    <footer className="container-page mt-16 pb-28 md:mt-24 md:pb-6">
      <section aria-label="Destaques da Kurio" className="bg-surface-card p-6 lg:h-[250px] lg:p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:flex lg:items-stretch lg:justify-between lg:gap-0">
          {features.map((feature, index) => (
            <div
              key={feature.letter}
              className={
                index === 0
                  ? 'flex flex-col gap-3 lg:flex-1 lg:border-r lg:border-primary lg:px-4'
                  : 'flex flex-col gap-3 lg:w-[265px] lg:border-r lg:border-primary lg:px-4'
              }
            >
              <span
                aria-hidden="true"
                className="flex size-[74px] items-center justify-center rounded-full bg-primary text-heading leading-none font-bold text-ink"
              >
                {feature.letter}
              </span>
              <h2 className="text-[17px] leading-4 font-bold text-foreground">{feature.title}</h2>
              <p className="max-w-[204px] text-body leading-[22px] text-text-secondary">
                {feature.text}
              </p>
            </div>
          ))}
          <div className="flex flex-col gap-3 md:col-span-2 lg:w-[357px] lg:px-4">
            <h2 className="text-lead leading-4 font-bold text-foreground">
              Antecipe-se ao próximo lançamento
            </h2>
            <NewsletterForm />
            <p className="text-[13px] leading-[22px] text-text-secondary">
              Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
            </p>
          </div>
        </div>
      </section>
      <div className="bg-surface-dark px-6 py-6 lg:h-[88px] lg:px-8 lg:py-0">
        <div className="grid h-full gap-4 sm:grid-cols-2 lg:flex lg:items-center lg:gap-[92px]">
          <p className="text-body leading-none font-bold tracking-[1.4px] text-foreground lg:flex-1">
            KURIO
          </p>
          <p className="text-body leading-[22px] text-foreground lg:flex-1">
            Feito para colecionadores,
            <br />
            criadores e cultura
          </p>
          <a
            href="mailto:contato@email.com"
            className="text-body leading-[22px] text-foreground hover:text-text-accent lg:flex-1"
          >
            contato@email.com
          </a>
          <a
            href="tel:+551140028922"
            className="text-body leading-[22px] text-foreground hover:text-text-accent lg:w-[228px]"
          >
            +55 11 4002 8922
          </a>
        </div>
      </div>
      <div className="bg-surface-card px-6 py-8 lg:h-[236px] lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:flex lg:gap-[124px]">
          <nav aria-label="Meu perfil" className="flex flex-col gap-2 lg:flex-1">
            <h2 className="text-lead leading-4 font-bold text-foreground">Meu perfil</h2>
            <ul>
              <li>
                <Link to="/profile" className={linkClass}>
                  Meu perfil
                </Link>
              </li>
              <li>
                <Link to="/wallets" className={linkClass}>
                  Minhas carteiras
                </Link>
              </li>
              <li>
                <Link to="/favorites" className={linkClass}>
                  Lista de interesse
                </Link>
              </li>
              <li className={linkClass}>
                <ComingSoon>Atividade</ComingSoon>
              </li>
              <li className={linkClass}>
                <ComingSoon>Estúdio do criador</ComingSoon>
              </li>
            </ul>
          </nav>
          <nav aria-label="Central de ajuda" className="flex flex-col gap-2 lg:flex-1">
            <h2 className="text-lead leading-4 font-bold text-foreground">Central de ajuda</h2>
            <ul>
              {[
                'Central de ajuda',
                'Como comprar NFTs',
                'Carteira e segurança',
                'Política do mercado',
                'Denunciar item',
              ].map((item) => (
                <li key={item} className={linkClass}>
                  <ComingSoon>{item}</ComingSoon>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Coleções" className="flex flex-col gap-2 lg:flex-1">
            <h2 className="text-lead leading-4 font-bold text-foreground">Coleções</h2>
            <ul>
              {footerCategories.map((id) => (
                <li key={id}>
                  <Link to="/" search={{ categories: [id] }} hash="catalogo" className={linkClass}>
                    {categoryLabels[id]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-8 lg:w-[228px]">
            <div className="flex w-[190px] flex-col gap-5">
              <h2 className="text-lead leading-4 font-bold text-foreground">Redes sociais</h2>
              <ul className="flex items-center gap-2.5">
                {socials.map((social) => (
                  <li key={social.name}>
                    <ComingSoon className="block opacity-100">
                      <img
                        src={social.icon}
                        alt={social.name}
                        width={30}
                        height={30}
                        className="size-[30px]"
                      />
                    </ComingSoon>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-lead leading-4 font-bold text-foreground">
                Carteiras compatíveis
              </h2>
              <p className="flex h-[26px] items-center justify-center rounded-md border border-border-soft bg-surface-dark px-2 text-tiny font-bold tracking-[0.1px] whitespace-pre text-text-accent">
                {'METAMASK  •  WALLETCONNECT  •  COINBASE'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-1 text-center text-body leading-[30px] text-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
