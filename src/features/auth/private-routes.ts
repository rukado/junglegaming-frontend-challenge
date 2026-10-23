const privatePrefixes = ['/checkout', '/profile', '/wallets', '/favorites', '/orders']

export function isPrivatePath(pathname: string) {
  return privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
