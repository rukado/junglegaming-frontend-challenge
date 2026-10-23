import { expect, test } from './support/fixtures.ts'

test('skeletons durante carregamento lento', { tag: '@mobile' }, async ({ app, page }) => {
  await app.open('/', 'slow-network')
  await expect(page.getByLabel('Carregando NFTs')).toBeVisible()
  await expect(app.catalogCards().first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByLabel('Carregando NFTs')).toHaveCount(0)
})

test('falha do catálogo com feedback e recuperação após nova tentativa', async ({ app, page }) => {
  await app.open('/', 'server-error')
  await expect(page.getByText('Não foi possível carregar o catálogo')).toBeVisible({
    timeout: 10_000,
  })
  await app.mocks().setScenario('instant')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(app.catalogCards()).toHaveCount(9)
})

test('falhas temporárias esgotam as tentativas e o usuário recupera', async ({ app, page }) => {
  await app.open('/', 'flaky-catalog')
  await expect(page.getByText('Não foi possível carregar o catálogo')).toBeVisible({
    timeout: 10_000,
  })
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(app.catalogCards()).toHaveCount(9)
})

test('detalhe indisponível mostra erro e recupera', async ({ app, page }) => {
  await app.open('/', 'instant')
  await app.mocks().setScenario('server-error')
  await app.goto('/nft/emerald-ape-042')
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
  await app.mocks().setScenario('instant')
  await page.getByRole('button', { name: /Tentar novamente/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
})

test('sem conexão mostra feedback de rede', async ({ app, page }) => {
  await app.open('/', 'offline')
  await expect(page.getByText(/Não foi possível conectar/).first()).toBeVisible({ timeout: 10_000 })
})
