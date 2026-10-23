import { expect, test } from './support/fixtures.ts'

test('acesso direto ao detalhe com edição na URL', { tag: '@mobile' }, async ({ app, page }) => {
  await app.open('/nft/emerald-ape-042')
  await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page).toHaveTitle('Emerald Ape #042 · Kurio')
  await expect(page).toHaveURL(/edition=emerald-ape-042--1-50/)
  await expect(page.getByRole('radio', { name: 'Edição 1/1 (esgotada)' })).toBeDisabled()

  await page.getByRole('radio', { name: 'Edição 1/10' }).check({ force: true })
  await expect(page).toHaveURL(/edition=emerald-ape-042--1-10/)
  await page.reload()
  await app.ready()
  await expect(page.getByRole('radio', { name: 'Edição 1/10' })).toBeChecked()
})

test('edição inválida na URL volta para a edição padrão', async ({ app, page }) => {
  await app.open('/nft/emerald-ape-042?edition=nao-existe')
  await expect(page).toHaveURL(/edition=emerald-ape-042--1-50/)
})

test('NFT inexistente mostra recurso não encontrado', { tag: '@mobile' }, async ({ app, page }) => {
  await app.open('/nft/nao-existe-999')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  await expect(page).toHaveTitle('NFT não encontrado · Kurio')
})

test('rota inexistente mostra 404', async ({ app, page }) => {
  await app.open('/pagina-que-nao-existe')
  await expect(page.getByText(/não encontrad/i).first()).toBeVisible()
})
