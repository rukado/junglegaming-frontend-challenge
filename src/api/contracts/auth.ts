import { z } from 'zod'
import { ensName, isoDate } from './common'

export const passwordRule = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(72, 'A senha deve ter no máximo 72 caracteres')
  .regex(/[A-Za-z]/, 'Inclua pelo menos uma letra')
  .regex(/\d/, 'Inclua pelo menos um número')

export const usernameRule = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres')
  .max(24, 'Use no máximo 24 caracteres')
  .regex(/^[a-z0-9_.]+$/, 'Use apenas letras minúsculas, números, ponto ou _')

export const user = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
  username: z.string(),
  ens: ensName.nullable(),
  walletNickname: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: isoDate,
  version: z.number().int().min(1),
})
export type User = z.infer<typeof user>

export const session = z.object({
  token: z.string(),
  expiresAt: isoDate,
  user,
})
export type Session = z.infer<typeof session>

export const loginRequest = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
})
export type LoginRequest = z.infer<typeof loginRequest>

export const registerRequest = z.object({
  username: usernameRule,
  email: z.email('Informe um e-mail válido'),
  password: passwordRule,
})
export type RegisterRequest = z.infer<typeof registerRequest>
