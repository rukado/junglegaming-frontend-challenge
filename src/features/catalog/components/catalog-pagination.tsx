import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type CatalogPaginationProps = {
  page: number
  totalPages: number
  onNavigate: () => void
}

function pageWindow(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const pages = new Set(
    [1, totalPages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= totalPages),
  )
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && value - previous > 1 ? (['gap', value] as const) : [value]
  })
}

const itemClass =
  'inline-flex size-[35px] items-center justify-center rounded-sm border border-border text-lead leading-4 text-foreground transition-colors hover:border-primary hover:text-text-accent'

export function CatalogPagination({ page, totalPages, onNavigate }: CatalogPaginationProps) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Paginação do catálogo" className="flex justify-end">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <li>
            <Link
              to="/"
              search={(prev) => ({ ...prev, page: page - 1 })}
              resetScroll={false}
              onClick={onNavigate}
              aria-label="Página anterior"
              className={itemClass}
            >
              <ChevronLeft className="size-[18px]" aria-hidden="true" />
            </Link>
          </li>
        )}
        {pageWindow(page, totalPages).map((value, index) =>
          value === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-text-secondary">
              …
            </li>
          ) : (
            <li key={value}>
              <Link
                to="/"
                search={(prev) => ({ ...prev, page: value })}
                resetScroll={false}
                onClick={onNavigate}
                aria-label={`Página ${value}`}
                aria-current={value === page ? 'page' : undefined}
                className={cn(
                  itemClass,
                  value === page && 'border-primary bg-primary font-bold text-ink hover:text-ink',
                )}
              >
                {value}
              </Link>
            </li>
          ),
        )}
        {page < totalPages && (
          <li>
            <Link
              to="/"
              search={(prev) => ({ ...prev, page: page + 1 })}
              resetScroll={false}
              onClick={onNavigate}
              aria-label="Próxima página"
              className={itemClass}
            >
              <ChevronRight className="size-[18px]" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
