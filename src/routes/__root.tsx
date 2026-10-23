import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { NotFound } from '@/components/layout/not-found'
import { SignInButton, SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { SkipLink } from '@/components/layout/skip-link'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <TooltipProvider>
      <HeadContent />
      <SkipLink />
      <SiteHeader cartCount={0} account={<SignInButton />} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileTabBar cartCount={0} />
      <Toaster />
    </TooltipProvider>
  )
}
