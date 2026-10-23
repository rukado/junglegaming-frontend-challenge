import { z } from 'zod'

const envSchema = z.object({
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_SOCKET_URL: z.string().default('https://realtime.kurio.local'),
})

export const env = envSchema.parse(import.meta.env)
