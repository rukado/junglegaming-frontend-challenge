export type NavSection = 'home' | 'market'

const marketPrefixes = ['/nft', '/cart', '/checkout', '/orders']

export function sectionFromPath(pathname: string): NavSection {
  return marketPrefixes.some((prefix) => pathname.startsWith(prefix)) ? 'market' : 'home'
}
