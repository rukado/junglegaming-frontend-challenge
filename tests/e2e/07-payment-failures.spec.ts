import { expect, test, users } from './support/fixtures.ts'

test.beforeEach(async ({ app }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.addToCart('emerald-ape-042')
})

test('pagamento recusado mantém os itens no carrinho', async ({ app, page }) => {
  await app.mocks().setScenario('payment-rejected')
  const review = await app.openReview()
  await review.getByRole('button', { name: 'Confirmar e assinar' }).click()
  const result = page.getByRole('dialog', { name: 'Pagamento recusado' })
  await expect(result.getByRole('alert')).toContainText('Nenhum valor foi cobrado')
  await result.getByRole('link', { name: 'Voltar ao carrinho' }).click()
  await expect(app.visible(page.getByRole('link', { name: 'Emerald Ape #042' }))).toHaveCount(1)
  expect((await app.mocks().orders())[0]?.status).toBe('rejected')
})

test('clique repetido gera um único pedido', async ({ app, page }) => {
  const review = await app.openReview()
  await review.getByRole('button', { name: 'Confirmar e assinar' }).dblclick()
  await expect(page).toHaveURL(/\/orders\/ord_/)
  await expect(
    page.getByText('Seus NFTs agora estão na sua carteira', { exact: true }),
  ).toBeVisible()
  expect(await app.mocks().orders()).toHaveLength(1)
})

test('timeout após criar o pedido recupera o mesmo pedido', async ({ app, page }) => {
  test.setTimeout(60_000)
  await app.mocks().setScenario('order-timeout')
  const review = await app.openReview()
  await review.getByRole('button', { name: 'Confirmar e assinar' }).click()
  await expect(review.getByText(/Não recebemos a confirmação a tempo/)).toBeVisible({
    timeout: 15_000,
  })
  await review.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page).toHaveURL(/\/orders\/ord_/)
  const orders = await app.mocks().orders()
  expect(orders).toHaveLength(1)
  expect(page.url()).toContain(orders[0]?.id ?? 'missing')
})

test('edição esgotada no envio bloqueia a compra', async ({ app, page }) => {
  await app.mocks().setScenario('sold-out-at-checkout')
  const review = await app.openReview()
  await review.getByRole('button', { name: 'Confirmar e assinar' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Um ou mais itens' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Revisar carrinho' }).first()).toBeVisible()
  expect(await app.mocks().orders()).toHaveLength(0)
})

test('carteira recusa a conexão', async ({ app, page }) => {
  await app.mocks().setScenario('wallet-rejected')
  await app.goto('/checkout')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('alert').filter({ hasText: 'A conexão foi recusada na carteira' }),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
