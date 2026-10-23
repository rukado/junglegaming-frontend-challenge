import { useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileScreenHeaderProps = {
  title: string
  className?: string
}

export function MobileScreenHeader({ title, className }: MobileScreenHeaderProps) {
  const router = useRouter()
  return (
    <div className={cn('relative flex h-11 items-center justify-center md:hidden', className)}>
      <button
        type="button"
        onClick={() =>
          window.history.length > 1 ? router.history.back() : void router.navigate({ to: '/' })
        }
        aria-label="Voltar"
        className="absolute left-0 flex size-[35px] items-center justify-center rounded-full border border-border bg-[#2f1d15] text-foreground transition-colors hover:text-text-accent"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
      </button>
      <h1 className="text-[20px] leading-4 font-bold text-foreground">{title}</h1>
    </div>
  )
}
