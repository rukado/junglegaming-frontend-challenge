import { ImageIcon, Loader2 } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { avatarMimeTypes, maxAvatarBytes, type User } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { useRemoveAvatar, useUpdateAvatar } from '../queries'

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

export function AvatarField({ user }: { user: User }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const [error, setError] = useState<string | null>(null)
  const updateAvatar = useUpdateAvatar()
  const removeAvatar = useRemoveAvatar()
  const busy = updateAvatar.isPending || removeAvatar.isPending

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (!(avatarMimeTypes as readonly string[]).includes(file.type)) {
      setError('Use uma imagem PNG, JPG ou WebP.')
      return
    }
    if (file.size > maxAvatarBytes) {
      setError('A imagem deve ter no máximo 1 MB.')
      return
    }
    try {
      const dataUrl = await readAsDataUrl(file)
      await updateAvatar.mutateAsync({ dataUrl })
      toast.success('Avatar atualizado.')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove() {
    setError(null)
    try {
      await removeAvatar.mutateAsync()
      toast.success('Avatar removido.')
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="mb-2.5 text-[15px] text-foreground">Avatar</legend>
      <div className="flex items-center gap-6">
        <span className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[#2f1d15] text-text-accent">
          {busy ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Seu avatar"
              width={50}
              height={50}
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon aria-label="Sem avatar" className="size-6" />
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={avatarMimeTypes.join(',')}
          aria-describedby={error ? errorId : undefined}
          aria-label="Escolher imagem do avatar"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="h-10 rounded-[3px] bg-primary px-6 text-body font-bold text-ink transition-colors hover:bg-text-accent disabled:opacity-60"
        >
          Alterar
        </button>
        <button
          type="button"
          disabled={busy || !user.avatarUrl}
          onClick={() => void remove()}
          className="text-body text-foreground transition-colors hover:text-text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remover
        </button>
      </div>
      <p className="text-caption text-text-secondary">PNG, JPG ou WebP com até 1 MB.</p>
      {error && (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
