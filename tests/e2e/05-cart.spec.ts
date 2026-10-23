import { expect, test, users } from './support/fixtures.ts'

test(
  'carrinho com quantidades, remoção, cupom e persistência após refresh e login',
  { tag: '@mobile' },
  async ({ app, page }) => {
    await app.open('/')
    await app.addToCart('emerald-ape-042')
    await app.addToCart('sage-nomad-089')

    const summary = page.getByRole('region', { name: 'Resumo da carteira' })
    const total = summary.locator('dd').last()
    await expect(total).toHaveText('2.896 ETH')

    const emeraldQuantity = app.visible(
      page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }),
    )
    await emeraldQuantity.getByRole('button', { name: 'Aumentar quantidade' }).click()
    await expect(emeraldQuantity.locator('output')).toHaveText('2')
    await expect(total).toHaveText('4.086 ETH')

    await app
      .visible(page.getByRole('button', { name: 'Remover Sage Nomad #089 do carrinho' }))
      .click()
    await expect(app.visible(page.getByRole('link', { name: 'Sage Nomad #089' }))).toHaveCount(0)
    await expect(total).toHaveText('2.396 ETH')
    await page.getByRole('button', { name: 'Desfazer' }).click()
    await expect(app.visible(page.getByRole('link', { name: 'Sage Nomad #089' }))).toHaveCount(1)
    await app
      .visible(page.getByRole('button', { name: 'Remover Sage Nomad #089 do carrinho' }))
      .click()
    await expect(total).toHaveText('2.396 ETH')

    const code = summary.getByLabel('Código promocional')
    await code.fill('NOPE')
    await summary.getByRole('button', { name: 'Aplicar' }).click()
    await expect(summary.getByRole('alert')).toHaveText(
      'Cupom inválido. Confira o código e tente novamente.',
    )
    await code.fill('BEMVINDO20')
    await summary.getByRole('button', { name: 'Aplicar' }).click()
    await expect(summary.getByRole('alert')).toHaveText('Este cupom expirou.')
    await code.fill('kurio10')
    await summary.getByRole('button', { name: 'Aplicar' }).click()
    await expect(summary.getByText('KURIO10', { exact: true })).toBeVisible()
    await expect(total).toHaveText('2.158 ETH')

    await page.reload()
    await app.ready()
    await expect(total).toHaveText('2.158 ETH')
    await expect(
      app
        .visible(page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }))
        .locator('output'),
    ).toHaveText('2')

    await summary.getByRole('link', { name: 'Conectar e finalizar' }).click()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/)
    await app.loginViaForm(users.ana)
    await expect(page).toHaveURL('/checkout')
    await app.goto('/cart')
    await expect(
      app
        .visible(page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }))
        .locator('output'),
    ).toHaveText('2')
    await expect(
      page
        .getByRole('region', { name: 'Resumo da carteira' })
        .getByText('KURIO10', { exact: true }),
    ).toBeVisible()
  },
)

test('limite de estoque é respeitado ao aumentar quantidade', async ({ app, page }) => {
  await app.open('/')
  await app.goto('/nft/emerald-ape-042?edition=emerald-ape-042--1-10')
  await page.getByRole('button', { name: 'COMPRAR' }).click()
  await page.waitForURL('**/cart')
  const group = app.visible(page.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }))
  const increase = group.getByRole('button', { name: 'Aumentar quantidade' })
  await increase.click()
  await increase.click()
  await expect(group.locator('output')).toHaveText('3')
  await expect(increase).toBeDisabled()
})
