import { expect, test, users } from './support/fixtures.ts'

test.beforeEach(async ({ app }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.addToCart('emerald-ape-042')
  await app.goto('/checkout')
  await app.waitForSocket('user_ana')
})

test('alteração de preço via Socket.IO durante o checkout exige revisão', async ({ app, page }) => {
  const summary = page.getByRole('region', { name: 'Seus NFTs' })
  await expect(summary.getByText('1.206 ETH')).toBeVisible()
  const confirm = page.getByRole('button', { name: 'Confirmar compra' })
  await expect(confirm).toBeEnabled()

  await app.mocks().updateNft('emerald-ape-042', {
    editionId: 'emerald-ape-042--1-50',
    priceEth: '1.50',
  })
  const events = await app.mocks().emittedEvents()
  expect(events.at(-1)?.type).toBe('nft.updated')

  await expect(
    page.getByText('Seu carrinho tem itens com preço ou disponibilidade alterados.'),
  ).toBeVisible()
  await expect(confirm).toBeDisabled()

  await page.getByRole('link', { name: 'Revisar carrinho' }).click()
  await expect(page.getByText('Seu carrinho mudou')).toBeVisible()
  await expect(page.getByText('Preço atualizado de 1.19 ETH para 1.50 ETH.').first()).toBeVisible()
  await page.getByRole('button', { name: 'Atualizar carrinho' }).click()
  await expect(page.getByText('Seu carrinho mudou')).toHaveCount(0)

  await app.goto('/checkout')
  await expect(page.getByRole('region', { name: 'Seus NFTs' }).getByText('1.516 ETH')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
})

test('edição esgotada via Socket.IO durante a revisão bloqueia o pedido', async ({ app, page }) => {
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  const review = page.getByRole('dialog', { name: 'Revise sua compra' })
  await expect(review).toBeVisible()

  await app
    .mocks()
    .updateNft('emerald-ape-042', { editionId: 'emerald-ape-042--1-50', available: 0 })
  await review.getByRole('button', { name: 'Confirmar e assinar' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Um ou mais itens' })).toBeVisible()
  expect(await app.mocks().orders()).toHaveLength(0)
})
