import { createId } from '@/lib/id'
import { readString, removeKey, storageKeys, writeString } from '@/lib/storage'

export function getGuestCartId(): string {
  const existing = readString(storageKeys.guestCartId)
  if (existing) return existing
  const id = createId('guest')
  writeString(storageKeys.guestCartId, id)
  return id
}

export function peekGuestCartId(): string | null {
  return readString(storageKeys.guestCartId)
}

export function resetGuestCartId() {
  removeKey(storageKeys.guestCartId)
}
