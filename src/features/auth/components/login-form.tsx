import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginRequest, type LoginRequest } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'
import { ComingSoon } from '@/components/common/coming-soon'
import { applyApiErrors } from '@/components/form/apply-api-errors'
import { FormAlert, PasswordField, TextField } from '@/components/form/field'
import { useLogin } from '../mutations'
import { safeRedirect } from '../session'

export function LoginForm({ redirect }: { redirect: string | undefined }) {
  const router = useRouter()
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequest),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login.mutateAsync(values)
      await router.navigate({ href: safeRedirect(redirect), replace: true })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['email', 'password']))
    }
  })

  const { errors } = form.formState
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-3"
      aria-describedby={formError ? 'login-error' : undefined}
    >
      <TextField
        label="E-mail"
        hideLabel
        type="email"
        autoComplete="email"
        placeholder="contato@email.com"
        error={errors.email?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('email')}
      />
      <PasswordField
        label="Senha"
        hideLabel
        autoComplete="current-password"
        placeholder="Senha"
        error={errors.password?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('password')}
      />
      <ComingSoon className="self-end text-body text-text-accent">Esqueceu a senha?</ComingSoon>
      <div id="login-error">
        <FormAlert message={formError} />
      </div>
      <ActionButton
        type="submit"
        pending={form.formState.isSubmitting}
        pendingLabel="Entrando…"
        className="mt-4 h-[60px] text-body-lg md:mt-6 md:h-[45px]"
      >
        Entrar
      </ActionButton>
    </form>
  )
}
