import { test as base, expect, type Locator, type Page } from '@playwright/test'

type NftEdition = { id: string; kind: string; priceEth: string; available: number }
type RealtimeEvent = {
  id: string
  type: string
  version: number
  resource: { type: string; id: string }
  data: Record<string, unknown>
}

export type MockApi = {
  reset: (options?: { scenario?: string }) => Promise<void>
  setScenario: (id: string) => string
  getScenario: () => string
  updateNft: (
    nftId: string,
    patch: { editionId?: string; priceEth?: string; available?: number },
  ) => RealtimeEvent
  buildNftEvent: (nftId: string) => RealtimeEvent
  emitRaw: (event: RealtimeEvent) => RealtimeEvent
  emittedEvents: () => RealtimeEvent[]
  connections: () => Array<{ id: string; userId: string | null }>
  dropSockets: () => void
  setSocketOffline: (offline: boolean) => void
  settleOrder: (orderId: string, outcome: 'confirmed' | 'rejected') => { status: string } | null
  orders: () => Array<{ id: string; status: string; lines: unknown[] }>
  expireSessions: () => void
  findNft: (nftId: string) => { id: string; name: string; editions: NftEdition[] } | undefined
}

declare global {
  interface Window {
    __kurioMocks?: MockApi
  }
}

export type TestUser = { email: string; password: string; name: string }

export const users: Record<'ana' | 'bruno', TestUser> = {
  ana: { email: 'ana@kurio.dev', password: 'kurio1234', name: 'Ana Colecionadora' },
  bruno: { email: 'bruno@kurio.dev', password: 'kurio5678', name: 'Bruno Artista' },
}

export class App {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get isMobile() {
    return (this.page.viewportSize()?.width ?? 1440) < 768
  }

  async open(path = '/', scenario = 'instant') {
    const url = new URL(path, 'http://app.local')
    url.searchParams.set('mockReset', '1')
    url.searchParams.set('scenario', scenario)
    await this.page.goto(`${url.pathname}${url.search}${url.hash}`)
    await this.ready()
  }

  async goto(path: string) {
    await this.page.goto(path)
    await this.ready()
  }

  async ready() {
    await this.page.waitForFunction(
      () => window.__kurioMocks !== undefined && document.getElementById('conteudo') !== null,
    )
  }

  mocks() {
    return {
      setScenario: (id: string) =>
        this.page.evaluate((scenario) => window.__kurioMocks?.setScenario(scenario), id),
      updateNft: (
        nftId: string,
        patch: { editionId?: string; priceEth?: string; available?: number },
      ) =>
        this.page.evaluate(([id, change]) => window.__kurioMocks?.updateNft(id, change), [
          nftId,
          patch,
        ] as const),
      editions: (nftId: string) =>
        this.page.evaluate((id) => window.__kurioMocks?.findNft(id)?.editions ?? [], nftId),
      orders: () => this.page.evaluate(() => window.__kurioMocks?.orders() ?? []),
      settleOrder: (orderId: string, outcome: 'confirmed' | 'rejected') =>
        this.page.evaluate(([id, result]) => window.__kurioMocks?.settleOrder(id, result), [
          orderId,
          outcome,
        ] as const),
      expireSessions: () => this.page.evaluate(() => window.__kurioMocks?.expireSessions()),
      dropSockets: () => this.page.evaluate(() => window.__kurioMocks?.dropSockets()),
      setSocketOffline: (offline: boolean) =>
        this.page.evaluate((value) => window.__kurioMocks?.setSocketOffline(value), offline),
      emittedEvents: () => this.page.evaluate(() => window.__kurioMocks?.emittedEvents() ?? []),
      emitRaw: (event: RealtimeEvent) =>
        this.page.evaluate((payload) => window.__kurioMocks?.emitRaw(payload), event),
      buildNftEvent: (nftId: string) =>
        this.page.evaluate((id) => window.__kurioMocks?.buildNftEvent(id), nftId),
      connections: () => this.page.evaluate(() => window.__kurioMocks?.connections() ?? []),
    }
  }

  async waitForSocket(userId?: string) {
    await expect
      .poll(async () => {
        const connections = await this.mocks().connections()
        return connections.some((connection) =>
          userId === undefined ? true : connection.userId === userId,
        )
      })
      .toBe(true)
  }

  async login(user: TestUser) {
    await this.page.evaluate(async ({ email, password }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const session = (await response.json()) as { token: string }
      window.localStorage.setItem('kurio.session.token', session.token)
    }, user)
    await this.page.reload()
    await this.ready()
    await expect(
      this.page.getByRole('button', { name: /^Conta de /, includeHidden: true }),
    ).toBeAttached()
  }

  accountButton() {
    return this.page.getByRole('button', { name: /^Conta de / })
  }

  async loginViaForm(user: TestUser) {
    const dialog = this.page.getByRole('dialog')
    await dialog.getByPlaceholder('contato@email.com', { exact: true }).fill(user.email)
    await dialog.getByPlaceholder('Senha', { exact: true }).fill(user.password)
    await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
  }

  async addToCart(nftId: string) {
    await this.goto(`/nft/${nftId}`)
    const buy = this.isMobile
      ? this.page.getByRole('button', { name: 'Comprar NFT' })
      : this.page.getByRole('button', { name: 'COMPRAR' })
    await buy.click()
    await this.page.waitForURL('**/cart')
  }

  async logout() {
    if (this.isMobile) {
      await this.goto('/profile')
      await this.page.getByRole('button', { name: 'Sair' }).click()
    } else {
      await this.accountButton().click()
      await this.page.getByRole('menuitem', { name: 'Sair' }).click()
    }
  }

  async openReview() {
    await this.goto('/checkout')
    await this.page.getByRole('button', { name: 'Confirmar compra' }).click()
    const dialog = this.page.getByRole('dialog', { name: 'Revise sua compra' })
    await expect(dialog).toBeVisible()
    return dialog
  }

  visible(locator: Locator) {
    return locator.filter({ visible: true })
  }

  async settleImages() {
    await this.page.evaluate(async () => {
      await document.fonts.ready
      const images = Array.from(document.images)
      images.forEach((image) => {
        image.loading = 'eager'
      })
      await Promise.all(
        images
          .filter((image) => !image.complete)
          .map(
            (image) =>
              new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true })
                image.addEventListener('error', resolve, { once: true })
              }),
          ),
      )
    })
    await this.page.waitForLoadState('networkidle')
  }

  catalog() {
    return this.page.locator('#catalogo')
  }

  catalogCards() {
    return this.catalog().getByRole('article')
  }
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, provide) => {
    await provide(new App(page))
  },
})

export { expect }
