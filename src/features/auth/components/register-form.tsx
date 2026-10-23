import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { registerRequest } from '@/api/contracts'
import { ActionButton } from '@/components/common/action-button'
import { applyApiErrors } from '@/components/form/apply-api-errors'
import { FormAlert, PasswordField, TextField } from '@/components/form/field'
import { useRegister } from '../mutations'
import { safeRedirect } from '../session'

const registerFormSchema = registerRequest
  .extend({ confirmPassword: z.string().min(1, 'Confirme sua senha') })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm({ redirect }: { redirect: string | undefined }) {
  const router = useRouter()
  const register = useRegister()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirm, ...values }) => {
    setFormError(null)
    try {
      await register.mutateAsync(values)
      await router.navigate({ href: safeRedirect(redirect), replace: true })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['username', 'email', 'password']))
    }
  })

  const { errors } = form.formState
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <TextField
        label="Nome de usuário"
        hideLabel
        autoComplete="username"
        placeholder="Nome de usuário"
        hint="Letras minúsculas, números, ponto ou _."
        error={errors.username?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('username')}
      />
      <TextField
        label="E-mail"
        hideLabel
        type="email"
        autoComplete="email"
        placeholder="Digite seu e-mail"
        error={errors.email?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('email')}
      />
      <PasswordField
        label="Senha"
        hideLabel
        autoComplete="new-password"
        placeholder="Senha"
        hint="Mínimo de 8 caracteres, com letras e números."
        error={errors.password?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('password')}
      />
      <PasswordField
        label="Confirmar senha"
        hideLabel
        autoComplete="new-password"
        placeholder="Confirmar senha"
        error={errors.confirmPassword?.message}
        inputClassName="h-[50px] md:h-10"
        {...form.register('confirmPassword')}
      />
      <FormAlert message={formError} />
      <ActionButton
        type="submit"
        pending={form.formState.isSubmitting}
        pendingLabel="Criando conta…"
        className="mt-4 h-[60px] text-body-lg md:mt-6 md:h-[45px]"
      >
        Criar conta
      </ActionButton>
    </form>
  )
}
