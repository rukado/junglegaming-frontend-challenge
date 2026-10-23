import { createRootRouteWithContext, HeadContent, Outlet, useMatches } from '@tanstack/react-router'
import type { RouterContext } from '@/app/router-context'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { NotFound } from '@/components/layout/not-found'
import { RouteError } from '@/components/layout/route-error'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { SkipLink } from '@/components/layout/skip-link'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AccountMenu } from '@/features/auth/components/account-menu'
import { SessionWatcher } from '@/features/auth/components/session-watcher'
import { cartItemCount, useCart } from '@/features/cart/queries'
import { cn } from '@/lib/utils'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
})

function RootLayout() {
  const { query } = useCart()
  const cartCount = cartItemCount(query.data)
  const minimalMobile = useMatches({
    select: (matches) => matches.some((match) => match.staticData.mobileChrome === 'minimal'),
  })

  return (
    <TooltipProvider>
      <HeadContent />
      <SessionWatcher />
      <SkipLink />
      <div className={cn(minimalMobile && 'hidden md:block')}>
        <SiteHeader cartCount={cartCount} account={<AccountMenu />} />
      </div>
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <div className={cn(minimalMobile && 'hidden md:block')}>
        <SiteFooter />
      </div>
      {!minimalMobile && <MobileTabBar cartCount={cartCount} />}
      <Toaster />
    </TooltipProvider>
  )
}
