const privateSuffixes = ['vercel.app']

export function getDomain(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (!host || /^[\d.]+$/.test(host) || host.includes(':')) return null
  const labels = host.split('.')
  const suffix = privateSuffixes.find((entry) => host === entry || host.endsWith(`.${entry}`))
  const size = suffix ? suffix.split('.').length + 1 : 2
  return labels.length >= size ? labels.slice(-size).join('.') : null
}
