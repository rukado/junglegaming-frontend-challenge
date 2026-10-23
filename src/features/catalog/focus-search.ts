export function focusCatalogSearch() {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-catalog-search]'))
  const visible = inputs.find((input) => input.offsetParent !== null)
  if (!visible) return false
  visible.focus({ preventScroll: true })
  visible.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  return true
}

export function scrollToCatalog() {
  document
    .getElementById('catalogo')
    ?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
