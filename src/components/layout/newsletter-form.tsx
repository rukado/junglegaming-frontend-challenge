import { useId, useState, type FormEvent } from 'react'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterForm() {
  const inputId = useId()
  const messageId = useId()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    if (!emailPattern.test(value)) {
      setNotice(null)
      setError('Informe um e-mail válido.')
      return
    }
    setError(null)
    setNotice(
      'A newsletter ainda não está disponível nesta demonstração. Nenhum e-mail foi cadastrado.',
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="sr-only">
        E-mail para receber lançamentos
      </label>
      <div className="flex h-10 w-full items-center justify-between overflow-hidden rounded-md bg-surface-dark shadow-[0_0_10px_rgba(10,6,4,0.45)] focus-within:ring-2 focus-within:ring-ring">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="digite seu e-mail..."
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className="h-full min-w-0 flex-1 bg-transparent pl-3 text-body leading-4 text-foreground outline-none placeholder:text-sand focus-visible:outline-none"
        />
        <button
          type="submit"
          className="h-full w-[85px] shrink-0 rounded-r-md bg-primary pr-1 pl-4 text-lead leading-4 font-bold text-ink hover:bg-text-accent"
        >
          Enviar
        </button>
      </div>
      <output id={messageId} htmlFor={inputId} className="block min-h-0 text-caption">
        {error && <span className="text-destructive">{error}</span>}
        {notice && <span className="text-text-secondary">{notice}</span>}
      </output>
    </form>
  )
}
