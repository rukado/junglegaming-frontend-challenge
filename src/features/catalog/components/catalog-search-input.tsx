import { useEffect, useId, useRef, useState } from 'react'
import { icons } from '@/components/common/icons'
import { MaskIcon } from '@/components/common/mask-icon'
import { cn } from '@/lib/utils'

type CatalogSearchInputProps = {
  value: string
  onCommit: (value: string) => void
  className?: string
  inputId?: string
}

export function CatalogSearchInput({
  value,
  onCommit,
  className,
  inputId,
}: CatalogSearchInputProps) {
  const generatedId = useId()
  const id = inputId ?? generatedId
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const commitRef = useRef(onCommit)

  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  useEffect(() => {
    commitRef.current = onCommit
  })

  useEffect(() => {
    if (draft.trim() === value) return
    const timeout = setTimeout(() => commitRef.current(draft.trim()), 350)
    return () => clearTimeout(timeout)
  }, [draft, value])

  return (
    <search className={className}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onCommit(draft.trim())
        }}
        className={cn(
          'flex h-[45px] items-center gap-2 rounded-[10px] bg-surface-card px-3 focus-within:ring-2 focus-within:ring-ring',
        )}
      >
        <label htmlFor={id} className="sr-only">
          Buscar NFTs por nome, coleção ou criador
        </label>
        <MaskIcon src={icons.searchMobile} className="size-[22px] shrink-0 text-sand" />
        <input
          id={id}
          data-catalog-search
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Explorar coleções"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-body font-bold text-foreground outline-none placeholder:text-sand focus-visible:outline-none"
        />
      </form>
    </search>
  )
}
