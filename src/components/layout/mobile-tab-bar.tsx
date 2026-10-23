import { Link, useRouterState } from '@tanstack/react-router'
import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'
import { cn } from '@/lib/utils'

type TabBarProps = {
  cartCount: number
}

const tabClass =
  'absolute top-[56.35%] flex size-11 -translate-x-1/2 -translate-y-3 items-center justify-center rounded-full'

export function MobileTabBar({ cartCount }: TabBarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const tone = (active: boolean) => (active ? 'text-text-accent' : 'text-text-secondary')

  return (
    <nav
      aria-label="Navegação inferior"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[126px] md:hidden"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-[24.6%] bottom-0">
        <img
          src={icons.tabbarBg}
          alt=""
          className="absolute top-[-42.13%] right-[-7.25%] bottom-[-21.06%] left-[-7.25%] h-[163.19%] w-[114.5%] max-w-none"
        />
      </div>
      <ul className="pointer-events-auto relative h-full">
        <li>
          <Link
            to="/"
            aria-label="Início"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={cn(tabClass, 'left-[11.12%]', tone(pathname === '/'))}
          >
            <MaskIcon src={icons.tabHome} className="size-5" />
          </Link>
        </li>
        <li>
          <Link
            to="/favorites"
            aria-label="Favoritos"
            aria-current={pathname === '/favorites' ? 'page' : undefined}
            className={cn(tabClass, 'left-[28.5%]', tone(pathname === '/favorites'))}
          >
            <MaskIcon src={icons.tabHeart} className="h-[18px] w-5" />
          </Link>
        </li>
        <li>
          <Link
            to="/"
            hash="catalogo"
            aria-label="Explorar coleções"
            className="absolute top-0 left-1/2 flex size-[65px] -translate-x-1/2 items-center justify-center rounded-full"
          >
            <img
              src={icons.tabbarFab}
              alt=""
              width={65}
              height={65}
              className="absolute inset-0 size-full"
            />
            <img src={icons.scan} alt="" width={27} height={24} className="relative h-6 w-[27px]" />
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            aria-label={
              cartCount > 0
                ? `Carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`
                : 'Carrinho'
            }
            aria-current={pathname === '/cart' ? 'page' : undefined}
            className={cn(tabClass, 'left-[72.95%]', tone(pathname === '/cart'))}
          >
            <MaskIcon src={icons.tabCart} className="size-5" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-surface-card bg-primary text-[8px] font-bold text-ink"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            aria-label="Perfil"
            aria-current={pathname === '/profile' ? 'page' : undefined}
            className={cn(
              tabClass,
              'left-[87.93%]',
              tone(pathname === '/profile' || pathname === '/wallets'),
            )}
          >
            <MaskIcon src={icons.tabUser} className="size-5" />
          </Link>
        </li>
      </ul>
    </nav>
  )
}
