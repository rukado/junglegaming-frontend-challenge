export function AuthNotice({ reason }: { reason: 'expired' | 'required' | undefined }) {
  if (!reason) return null
  return (
    <output className="block w-full max-w-[340px] rounded-sm border border-border-soft bg-surface-dark px-3 py-2 text-center text-caption text-text-secondary">
      {reason === 'expired'
        ? 'Sua sessão expirou. Entre novamente para continuar de onde parou.'
        : 'Entre na sua conta para continuar.'}
    </output>
  )
}
