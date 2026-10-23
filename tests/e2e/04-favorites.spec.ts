import { expect, test, users } from './support/fixtures.ts'

test('visitante é levado ao login ao favoritar', async ({ app, page }) => {
  await app.open('/')
  await app.catalog().getByRole('button', { name: 'Favoritar Neon Vessel #552' }).click()
  await expect(page).toHaveURL(/\/login\?redirect=/)
})

test('favoritar é otimista e persiste', async ({ app, page }) => {
  await app.open('/')
  await app.login(users.ana)
  const button = app.catalog().getByRole('button', { name: /Neon Vessel #552/ })
  await expect(button).toHaveAttribute('aria-pressed', 'false')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await app.ready()
  await expect(app.catalog().getByRole('button', { name: /Neon Vessel #552/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('falha na mutation desfaz o estado e permite nova tentativa', async ({ app, page }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.mocks().setScenario('favorites-failure')
  const button = app.catalog().getByRole('button', { name: /Neon Vessel #552/ })
  await button.click()
  await expect(page.getByText(/Não foi possível favoritar Neon Vessel #552/)).toBeVisible()
  await expect(button).toHaveAttribute('aria-pressed', 'false')

  await app.mocks().setScenario('instant')
  await button.click()
  await expect(button).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Neon Vessel #552 adicionado aos favoritos.')).toBeVisible()
})
