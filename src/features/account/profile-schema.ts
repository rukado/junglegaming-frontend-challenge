import { z } from 'zod'
import { passwordRule, updateProfileRequest, type User } from '@/api/contracts'

export const profileFormSchema = updateProfileRequest
  .omit({ version: true })
  .extend({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    const changing = Boolean(values.currentPassword || values.newPassword || values.confirmPassword)
    if (!changing) return
    if (!values.currentPassword) {
      ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Informe a senha atual' })
    }
    const result = passwordRule.safeParse(values.newPassword)
    if (!result.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: result.error.issues[0]?.message ?? 'Senha inválida',
      })
    }
    if (values.confirmPassword !== values.newPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'As senhas não conferem' })
    }
  })
export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function profileDefaults(user: User): ProfileFormValues {
  return {
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    ens: user.ens ?? { label: '', suffix: '.eth' },
    walletNickname: user.walletNickname ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}
