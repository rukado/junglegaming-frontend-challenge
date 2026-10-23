let ready: Promise<unknown> = Promise.resolve()

export function setTransportReady(promise: Promise<unknown>) {
  ready = promise
}

export function transportReady(): Promise<unknown> {
  return ready
}
