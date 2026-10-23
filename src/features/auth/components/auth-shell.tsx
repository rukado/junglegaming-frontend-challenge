import { Link, useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ComingSoon } from '@/components/common/coming-soon'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { CatalogSection } from '@/features/catalog/components/catalog-section'
import { HomeHero } from '@/features/catalog/components/home-hero'
import { catalogSearchSchema } from '@/features/catalog/search'
import { cn } from '@/lib/utils'

type AuthShellProps = {
  mode: 'login' | 'register'
  redirect: string | undefined
  description: string
  notice?: ReactNode
  children: ReactNode
  footer: ReactNode
}

const backdropSearch = catalogSearchSchema.parse({})

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.27 6.6l4 3.11C6.22 6.87 8.87 4.76 12 4.76Z"
      />
    </svg>
  )
}

function FacebookMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="#3B5998"
        d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.69V4.14A22.6 22.6 0 0 0 14.32 4C11.88 4 10.2 5.49 10.2 8.22v2.38H7.45v3.2h2.75V22h3.3Z"
      />
    </svg>
  )
}

export function SocialAuthButtons() {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="text-body text-foreground">Ou continue com</span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      {[
        { label: 'Continuar com Google', icon: <GoogleMark /> },
        { label: 'Continuar com Facebook', icon: <FacebookMark /> },
      ].map((item) => (
        <ComingSoon
          key={item.label}
          className="flex h-10 w-full max-w-[340px] items-center justify-center gap-3 rounded-sm border border-border text-body text-text-secondary md:h-10"
        >
          {item.icon}
          {item.label}
        </ComingSoon>
      ))}
    </div>
  )
}

export function AuthShell({
  mode,
  redirect,
  description,
  notice,
  children,
  footer,
}: AuthShellProps) {
  const navigate = useNavigate()
  const close = () => {
    if (redirect) void navigate({ href: redirect })
    else void navigate({ to: '/' })
  }

  return (
    <>
      <div aria-hidden="true" inert className="hidden md:block">
        <HomeHero onExplore={() => undefined} />
        <CatalogSection search={backdropSearch} onSearchChange={() => undefined} />
      </div>
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col items-center gap-0 overflow-y-auto rounded-none border-0 bg-ink px-7 pt-20 pb-10 sm:max-w-none',
            'md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[calc(100dvh-2rem)] md:w-[500px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-none md:border-0 md:bg-surface-card md:px-0 md:pt-12 md:pb-0',
          )}
        >
          <DialogClose
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-sm text-text-accent hover:bg-surface-dark md:top-3 md:right-3"
            aria-label="Fechar"
          >
            <X aria-hidden="true" className="size-[18px]" />
          </DialogClose>
          <p
            aria-hidden="true"
            className="mb-10 flex h-[136px] w-full items-center justify-center text-[36px] font-bold tracking-[3.6px] text-foreground md:hidden"
          >
            KURIO
          </p>
          <div className="flex w-full flex-col items-center gap-6 md:px-20">
            <nav
              aria-label="Tipo de acesso"
              className="flex items-center gap-2 text-heading leading-4 font-bold"
            >
              <Link
                to="/login"
                search={{ redirect }}
                replace
                className={
                  mode === 'login' ? 'text-foreground' : 'text-text-accent hover:underline'
                }
                aria-current={mode === 'login' ? 'page' : undefined}
              >
                Entrar
              </Link>
              <span aria-hidden="true" className="h-5 w-px bg-primary" />
              <Link
                to="/register"
                search={{ redirect }}
                replace
                className={
                  mode === 'register' ? 'text-foreground' : 'text-text-accent hover:underline'
                }
                aria-current={mode === 'register' ? 'page' : undefined}
              >
                Criar conta
              </Link>
            </nav>
            <DialogTitle className="sr-only">
              {mode === 'login' ? 'Entrar na Kurio' : 'Criar conta na Kurio'}
            </DialogTitle>
            <DialogDescription className="max-w-[404px] text-center text-body leading-4 text-foreground">
              {description}
            </DialogDescription>
            {notice}
            <div className="w-full max-w-[340px]">{children}</div>
          </div>
          <div className="mt-8 flex w-full flex-col items-center gap-8 md:mt-6">
            <div className="w-full md:px-0">
              <SocialAuthButtons />
            </div>
            <div className="text-center text-body text-foreground md:hidden">{footer}</div>
          </div>
          <span aria-hidden="true" className="mt-10 hidden h-2.5 w-full bg-primary md:block" />
        </DialogContent>
      </Dialog>
    </>
  )
}
