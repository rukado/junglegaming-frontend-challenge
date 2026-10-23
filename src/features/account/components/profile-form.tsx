import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { User } from '@/api/contracts'
import { toApiError } from '@/api/errors'
import { ActionButton } from '@/components/common/action-button'
import { applyApiErrors } from '@/components/form/apply-api-errors'
import { EnsField } from '@/components/form/ens-field'
import { FormAlert, PasswordField, TextField } from '@/components/form/field'
import { sessionQueryOptions } from '@/features/auth/session'
import { sessionStore } from '@/features/auth/session-store'
import { profileDefaults, profileFormSchema, type ProfileFormValues } from '../profile-schema'
import { useChangePassword, useUpdateProfile } from '../queries'
import { AvatarField } from './avatar-field'

const profileFields = ['displayName', 'username', 'email', 'ens.label', 'walletNickname'] as const
const passwordFields = ['currentPassword', 'newPassword'] as const

export function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const [formError, setFormError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileDefaults(user),
    mode: 'onTouched',
  })
  const { register, formState, control } = form
  const errors = formState.errors
  const pending = updateProfile.isPending || changePassword.isPending

  async function reloadProfile() {
    const session = await queryClient.fetchQuery({
      ...sessionQueryOptions(sessionStore.getToken()),
      staleTime: 0,
    })
    form.reset(profileDefaults(session.user))
    setStale(false)
    setFormError(null)
  }

  const submit = form.handleSubmit(async (values) => {
    setFormError(null)
    setStale(false)
    const saved = profileDefaults(user)
    const profileChanged =
      values.displayName !== saved.displayName ||
      values.username !== saved.username ||
      values.email !== saved.email ||
      values.walletNickname !== saved.walletNickname ||
      values.ens.label !== saved.ens.label ||
      values.ens.suffix !== saved.ens.suffix
    const passwordChanged = Boolean(values.newPassword)
    if (!profileChanged && !passwordChanged) {
      toast.info('Nenhuma alteração para salvar.')
      return
    }
    try {
      let updated = user
      if (profileChanged) {
        updated = await updateProfile.mutateAsync({
          displayName: values.displayName,
          username: values.username,
          email: values.email,
          ens: values.ens,
          walletNickname: values.walletNickname,
          version: user.version,
        })
      }
      if (passwordChanged) {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      }
      form.reset(profileDefaults(updated))
      toast.success(
        profileChanged && passwordChanged
          ? 'Perfil e senha atualizados.'
          : passwordChanged
            ? 'Senha alterada.'
            : 'Perfil atualizado.',
      )
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.code === 'CONFLICT' && Object.keys(apiError.fieldErrors).length === 0) {
        setStale(true)
        setFormError(apiError.message)
        return
      }
      setFormError(applyApiErrors(error, form.setError, [...profileFields, ...passwordFields]))
    }
  })

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-8">
      <fieldset className="flex min-w-0 flex-col gap-6">
        <legend className="mb-6 text-body-lg leading-4 font-bold text-foreground">
          Perfil do colecionador
        </legend>
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
          <TextField
            label="Nome de exibição"
            required
            autoComplete="name"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
          <TextField
            label="Nome de usuário"
            required
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <TextField
            label="E-mail"
            type="email"
            required
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <EnsField
            control={control}
            register={register}
            labelName="ens.label"
            suffixName="ens.suffix"
            error={errors.ens?.label}
          />
          <TextField
            label="Apelido da carteira"
            required
            error={errors.walletNickname?.message}
            {...register('walletNickname')}
          />
          <AvatarField user={user} />
        </div>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-6 sm:max-w-[417px]">
        <legend className="mb-6 text-body-lg leading-4 font-medium text-foreground">
          Alterar senha
        </legend>
        <PasswordField
          label="Senha atual"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <PasswordField
          label="Nova senha"
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres, com letras e números."
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordField
          label="Confirmar nova senha"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </fieldset>

      <div className="flex flex-col gap-3 sm:max-w-[417px]">
        <FormAlert message={formError} />
        {stale && (
          <button
            type="button"
            onClick={() => void reloadProfile()}
            className="w-fit text-body font-bold text-text-accent underline underline-offset-4"
          >
            Recarregar dados
          </button>
        )}
        <ActionButton
          type="submit"
          pending={pending}
          pendingLabel="Salvando…"
          className="w-[131px] rounded-[3px] px-0"
        >
          Salvar
        </ActionButton>
      </div>
    </form>
  )
}
