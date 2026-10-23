import { Link } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingCart,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { ComingSoon } from '@/components/common/coming-soon'
import { useLogout } from '@/features/auth/mutations'
import { cn } from '@/lib/utils'

type NavItem =
  | { label: string; icon: LucideIcon; to: '/profile' | '/wallets' | '/favorites' }
  | { label: string; icon: LucideIcon; to?: undefined }

const items: NavItem[] = [
  { label: 'Dados do perfil', icon: User, to: '/profile' },
  { label: 'Carteiras', icon: MapPin, to: '/wallets' },
  { label: 'Atividade', icon: ShoppingCart },
  { label: 'Lista de interesse', icon: Heart, to: '/favorites' },
  { label: 'Ofertas', icon: Activity },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: AlertTriangle },
]

const itemClass =
  'relative flex h-11 shrink-0 items-center gap-3 px-4 text-[15px] whitespace-nowrap text-text-accent transition-colors md:h-[45px]'

function AccountNav() {
  const logout = useLogout()
  return (
    <nav
      aria-label="Minha conta"
      className="-mx-4 flex flex-col bg-surface-card md:mx-0 md:w-[310px] md:shrink-0 md:self-start md:pt-2"
    >
      <p className="hidden px-2.5 py-2.5 text-lead leading-4 font-bold text-foreground md:block">
        Meu perfil
      </p>
      <ul className="flex overflow-x-auto md:flex-col md:overflow-visible">
        {items.map(({ label, icon: Icon, to }) => (
          <li key={label} className={cn(!to && 'hidden md:block')}>
            {to ? (
              <Link
                to={to}
                className={cn(itemClass, 'hover:bg-surface-dark')}
                activeProps={{
                  'aria-current': 'page',
                  className:
                    'font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-primary md:after:inset-x-auto md:after:inset-y-0 md:after:left-0 md:after:h-auto md:after:w-1.5',
                }}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                {label}
              </Link>
            ) : (
              <ComingSoon className={itemClass}>
                <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                {label}
              </ComingSoon>
            )}
          </li>
        ))}
        <li className="md:border-t md:border-primary/30">
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className={cn(itemClass, 'w-full font-bold hover:bg-surface-dark md:h-10')}
          >
            <LogOut aria-hidden="true" className="size-5 shrink-0" />
            Sair
          </button>
        </li>
      </ul>
    </nav>
  )
}

export function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container-page flex flex-col gap-6 pt-4 pb-16 md:flex-row md:gap-7 md:pt-8">
      <AccountNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
