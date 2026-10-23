import { editionLabels, type Edition } from '@/api/contracts'
import { cn } from '@/lib/utils'

type EditionPickerProps = {
  editions: Edition[]
  selectedId: string
  onSelect: (editionId: string) => void
}

export function EditionPicker({ editions, selectedId, onSelect }: EditionPickerProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-body font-bold text-foreground">Edição:</legend>
      <div className="flex flex-wrap gap-1.5 md:gap-1.5">
        {editions.map((edition) => {
          const soldOut = edition.available === 0
          const selected = edition.id === selectedId
          return (
            <label
              key={edition.id}
              className={cn(
                'relative inline-flex h-7 cursor-pointer items-center rounded-full border px-2 text-body leading-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring',
                selected
                  ? 'border-primary bg-surface-dark text-text-accent'
                  : 'border-border-soft text-text-secondary hover:border-primary',
                soldOut && 'cursor-not-allowed line-through opacity-60',
              )}
            >
              <input
                type="radio"
                name="edition"
                value={edition.id}
                checked={selected}
                disabled={soldOut}
                onChange={() => onSelect(edition.id)}
                aria-label={`Edição ${editionLabels[edition.kind]}${soldOut ? ' (esgotada)' : ''}`}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
              />
              <span aria-hidden="true">{editionLabels[edition.kind]}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
