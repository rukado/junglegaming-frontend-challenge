import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ComingSoon } from '@/components/common/coming-soon'
import { icons } from '@/components/common/icons'
import { Logo } from '@/components/common/logo'
import { MaskIcon } from '@/components/common/mask-icon'
import { cn } from '@/lib/utils'
import { CartIndicator } from './cart-indicator'
import { sectionFromPath } from './nav-config'

type SiteHeaderProps = {
  cartCount: number
  account: ReactNode
}

const navLinkBase =
  'relative inline-flex flex-col gap-6 pb-0 text-body-lg leading-none whitespace-nowrap after:h-[3px] after:w-full after:rounded-full after:content-[""]'

export function SiteHeader({ cartCount, account }: SiteHeaderProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const section = sectionFromPath(pathname)

  return (
    <header className="container-page pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-[35px] items-center lg:w-40">
          <Logo />
        </div>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-start gap-6 lg:gap-10">
            <li className="flex">
              <Link
                to="/"
                className={cn(
                  navLinkBase,
                  section === 'home'
                    ? 'font-bold text-text-accent after:bg-primary'
                    : 'text-foreground after:bg-transparent hover:text-text-accent',
                )}
                aria-current={section === 'home' && pathname === '/' ? 'page' : undefined}
              >
                Início
              </Link>
            </li>
            <li className="flex">
              <Link
                to="/"
                hash="catalogo"
                className={cn(
                  navLinkBase,
                  section === 'market'
                    ? 'font-bold text-text-accent after:bg-primary'
                    : 'text-foreground after:bg-transparent hover:text-text-accent',
                )}
              >
                Mercado
              </Link>
            </li>
            <li className="flex text-body-lg leading-none text-foreground">
              <ComingSoon>Criadores</ComingSoon>
            </li>
            <li className="flex text-body-lg leading-none text-foreground">
              <ComingSoon>Aprenda</ComingSoon>
            </li>
          </ul>
        </nav>
        <div className="flex h-[35px] items-center gap-2 md:gap-4">
          <Link
            to="/"
            hash="busca"
            aria-label="Buscar NFTs"
            className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:text-text-accent"
          >
            <MaskIcon src={icons.search} className="size-5" />
          </Link>
          <CartIndicator count={cartCount} className="text-foreground hover:text-text-accent" />
          <div className="hidden md:block">{account}</div>
        </div>
      </div>
      {section === 'home' && <div aria-hidden="true" className="mt-0 h-px w-full bg-primary/60" />}
    </header>
  )
}

export function SignInButton() {
  return (
    <Link
      to="/login"
      className="inline-flex h-[35px] w-[100px] items-center justify-center gap-1 rounded-md bg-primary text-body-lg font-medium leading-none text-ink transition-colors hover:bg-text-accent"
    >
      <MaskIcon src={icons.login} className="size-5 text-ink" />
      Entrar
    </Link>
  )
}
