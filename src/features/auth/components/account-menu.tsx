import { Link, useRouterState } from '@tanstack/react-router'
import { Heart, LogOut, User, Wallet } from 'lucide-react'
import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '../mutations'
import { useSession } from '../session'
import { UserAvatar } from './user-avatar'

export function AccountMenu() {
  const session = useSession()
  const logout = useLogout()
  const href = useRouterState({ select: (state) => state.location.href })

  if (session.status === 'loading') {
    return <div aria-hidden="true" className="skeleton-shimmer h-[35px] w-[100px] rounded-md" />
  }

  if (session.status === 'anonymous') {
    return (
      <Link
        to="/login"
        search={{
          redirect: href.startsWith('/login') || href.startsWith('/register') ? undefined : href,
        }}
        className="inline-flex h-[35px] w-[100px] items-center justify-center gap-1 rounded-md bg-primary text-body-lg font-medium leading-none text-ink transition-colors hover:bg-text-accent"
      >
        <MaskIcon src={icons.login} className="size-5 text-ink" />
        Entrar
      </Link>
    )
  }

  const { user } = session
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Conta de ${user.displayName}`}
        className="flex h-[35px] items-center gap-2 rounded-md border border-border-soft pr-3 pl-1 text-body text-foreground hover:border-primary"
      >
        <UserAvatar user={user} size={28} />
        <span className="max-w-[120px] truncate">{user.displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border-soft bg-surface-card">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-body font-bold text-foreground">{user.displayName}</span>
          <span className="truncate text-caption font-normal text-text-secondary">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User aria-hidden="true" /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wallets">
            <Wallet aria-hidden="true" /> Carteiras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">
            <Heart aria-hidden="true" /> Favoritos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
