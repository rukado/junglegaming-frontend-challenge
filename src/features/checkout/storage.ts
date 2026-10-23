import { createId } from '@/lib/id'
import { readJson, removeKey, storageKeys, writeJson } from '@/lib/storage'
import { checkoutFormSchema, type CheckoutFormValues } from './schema'

const attemptKey = 'kurio.checkout.attempt'

function draftKey(userId: string) {
  return `${storageKeys.checkoutDraft}:${userId}`
}

export function readCheckoutDraft(userId: string): Partial<CheckoutFormValues> | null {
  const parsed = checkoutFormSchema.partial().safeParse(readJson(draftKey(userId), 'session'))
  return parsed.success ? parsed.data : null
}

export function writeCheckoutDraft(userId: string, values: CheckoutFormValues) {
  writeJson(draftKey(userId), values, 'session')
}

export function clearCheckoutDraft(userId: string) {
  removeKey(draftKey(userId), 'session')
}

type Attempt = { key: string; fingerprint: string }

export function idempotencyKeyFor(fingerprint: string): string {
  const current = readJson<Attempt>(attemptKey, 'session')
  if (current && current.fingerprint === fingerprint) return current.key
  const next: Attempt = { key: createId('idem'), fingerprint }
  writeJson(attemptKey, next, 'session')
  return next.key
}

export function clearIdempotencyKey() {
  removeKey(attemptKey, 'session')
}
