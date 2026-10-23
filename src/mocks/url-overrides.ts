export type MockOverrides = { scenario: string | null; reset: boolean }

export function takeMockOverrides(): MockOverrides {
  const url = new URL(window.location.href)
  const scenario = url.searchParams.get('scenario')
  const reset = url.searchParams.get('mockReset')
  if (scenario || reset) {
    url.searchParams.delete('scenario')
    url.searchParams.delete('mockReset')
    window.history.replaceState(window.history.state, '', url)
  }
  return { scenario, reset: reset === '1' }
}
