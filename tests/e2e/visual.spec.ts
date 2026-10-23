import { expect, test, users } from './support/fixtures.ts'

test.describe('regressão visual', { tag: '@mobile' }, () => {
  test('início', async ({ app, page }) => {
    await app.open('/')
    await expect(app.catalogCards()).toHaveCount(9)
    await app.settleImages()
    await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
  })

  test('detalhe', async ({ app, page }) => {
    await app.open('/nft/emerald-ape-042')
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
    await app.settleImages()
    await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
  })

  test('carrinho', async ({ app, page }) => {
    await app.open('/')
    await app.addToCart('emerald-ape-042')
    await app.addToCart('sage-nomad-089')
    await expect(
      page.getByRole('region', { name: 'Resumo da carteira' }).locator('dd').last(),
    ).toHaveText('2.896 ETH')
    await app.settleImages()
    await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
  })

  test('pagamento', async ({ app, page }) => {
    await app.open('/')
    await app.login(users.ana)
    await app.addToCart('emerald-ape-042')
    await app.goto('/checkout')
    await expect(
      page.getByRole('region', { name: 'Seus NFTs' }).getByText('1.206 ETH'),
    ).toBeVisible()
    await app.settleImages()
    await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
  })
})
