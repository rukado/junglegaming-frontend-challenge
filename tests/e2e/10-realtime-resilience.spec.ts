import { expect, test, users } from './support/fixtures.ts'

test('eventos duplicados ou antigos são ignorados', async ({ app, page }) => {
  await app.open('/nft/emerald-ape-042')
  await app.waitForSocket()
  const price = page
    .locator('main')
    .getByText(/^\d+\.\d+ ETH$/)
    .first()
  await expect(price).toHaveText('1.19 ETH')

  await app
    .mocks()
    .updateNft('emerald-ape-042', { editionId: 'emerald-ape-042--1-50', priceEth: '2.50' })
  await expect(price).toHaveText('2.50 ETH')

  const last = (await app.mocks().emittedEvents()).at(-1)
  if (!last) throw new Error('evento não emitido')
  const repriced = (value: string) => ({
    ...(last.data as Record<string, unknown>),
    editions: (last.data.editions as Array<Record<string, unknown>>).map((edition) => ({
      ...edition,
      priceEth: value,
    })),
  })
  await app
    .mocks()
    .emitRaw({ ...last, id: 'evt_stale', version: last.version - 1, data: repriced('9.99') })
  await app.mocks().emitRaw({ ...last, data: repriced('7.77') })
  await expect.poll(async () => (await app.mocks().emittedEvents()).length).toBeGreaterThan(2)
  await page.waitForTimeout(500)
  await expect(price).toHaveText('2.50 ETH')
})

test('desconexão do Socket.IO com reconciliação ao reconectar', async ({ app, page }) => {
  await app.open('/')
  await app.waitForSocket()
  await page.clock.install()
  const card = app.catalogCards().filter({ hasText: 'Emerald Ape #042' })
  await expect(card.getByText('1.19 ETH')).toBeVisible()

  await app.mocks().setSocketOffline(true)
  await page.clock.fastForward(5_000)
  await expect(page.getByText('Atualizações em tempo real pausadas. Reconectando…')).toBeVisible()

  await app
    .mocks()
    .updateNft('emerald-ape-042', { editionId: 'emerald-ape-042--1-50', priceEth: '0.42' })
  await page.waitForTimeout(300)
  await expect(card.getByText('1.19 ETH')).toBeVisible()

  await app.mocks().setSocketOffline(false)
  await page.clock.fastForward(6_000)
  await expect(card.getByText('0.42 ETH')).toBeVisible()
  await expect(page.getByText('Atualizações em tempo real pausadas. Reconectando…')).toHaveCount(0)
})

test('pedido pendente é retomado e confirmado via Socket.IO', async ({ app, page }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.addToCart('emerald-ape-042')
  await app.mocks().setScenario('payment-pending')
  const review = await app.openReview()
  await review.getByRole('button', { name: 'Confirmar e assinar' }).click()
  await expect(page).toHaveURL(/\/orders\/ord_/)
  const orderId = page.url().split('/').pop() ?? ''
  await expect(page.getByRole('dialog', { name: 'Processando pagamento' })).toBeVisible()

  await app.goto('/')
  await page.reload()
  await app.ready()
  await app.goto('/checkout')
  await expect(
    page.getByText('Você tem uma compra em processamento.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Acompanhar pedido' }).click()
  await expect(page).toHaveURL(`/orders/${orderId}`)
  await app.waitForSocket('user_ana')

  await app.mocks().settleOrder(orderId, 'confirmed')
  await expect(
    page.getByText('Seus NFTs agora estão na sua carteira', { exact: true }),
  ).toBeVisible({
    timeout: 4_000,
  })
})
