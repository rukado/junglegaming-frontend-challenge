import { z } from 'zod'
import { passwordRule, usernameRule, user } from './auth'
import { ensSuffix } from './common'

export const profile = user
export type Profile = z.infer<typeof profile>

export const ensLabelRule = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{3,32}$/, 'Use de 3 a 32 caracteres: letras minúsculas, números ou hífen')

export const updateProfileRequest = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe seu nome de exibição')
    .max(40, 'Use no máximo 40 caracteres'),
  username: usernameRule,
  email: z.email('Informe um e-mail válido'),
  ens: z.object({ label: ensLabelRule, suffix: ensSuffix }),
  walletNickname: z
    .string()
    .trim()
    .min(2, 'Informe o apelido da carteira')
    .max(32, 'Use no máximo 32 caracteres'),
  version: z.number().int().min(1),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequest>

export const avatarMimeTypes = ['image/png', 'image/jpeg', 'image/webp'] as const
export const maxAvatarBytes = 1_000_000

export const updateAvatarRequest = z.object({
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, 'Formato de imagem inválido'),
})
export type UpdateAvatarRequest = z.infer<typeof updateAvatarRequest>

export const changePasswordRequest = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: passwordRule,
})
export type ChangePasswordRequest = z.infer<typeof changePasswordRequest>
