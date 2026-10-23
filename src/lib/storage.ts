export const storageKeys = {
  sessionToken: 'kurio.session.token',
  guestCartId: 'kurio.cart.guest',
  pendingOrders: 'kurio.orders.pending',
  checkoutDraft: 'kurio.checkout.draft',
} as const

function getStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readString(key: string, kind: 'local' | 'session' = 'local'): string | null {
  try {
    return getStorage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeString(key: string, value: string, kind: 'local' | 'session' = 'local') {
  try {
    getStorage(kind)?.setItem(key, value)
  } catch {
    return
  }
}

export function removeKey(key: string, kind: 'local' | 'session' = 'local') {
  try {
    getStorage(kind)?.removeItem(key)
  } catch {
    return
  }
}

export function readJson<T>(key: string, kind: 'local' | 'session' = 'local'): T | null {
  const raw = readString(key, kind)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown, kind: 'local' | 'session' = 'local') {
  writeString(key, JSON.stringify(value), kind)
}
