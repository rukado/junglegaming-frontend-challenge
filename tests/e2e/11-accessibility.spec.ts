import { expect, test } from './support/fixtures.ts'

test('link de pular conteúdo e navegação por teclado no catálogo', async ({ app, page }) => {
  await app.open('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#conteudo')).toBeFocused()

  const search = app.catalog().getByRole('searchbox', { name: /Buscar NFTs/ })
  await search.focus()
  await page.keyboard.type('baron')
  await expect(page).toHaveURL(/q=baron/)
  const link = app.catalog().getByRole('link', { name: 'Ivory Baron #088' })
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Ivory Baron #088' })).toBeVisible()
})

test('diálogo de login prende o foco e fecha com Escape', async ({ app, page }) => {
  await app.open('/login')
  const dialog = page.getByRole('dialog', { name: 'Entrar na Kurio' })
  await expect(dialog).toBeVisible()
  for (let index = 0; index < 15; index += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await expect(dialog).toHaveCount(0)
})

test('validação de formulário marca campos e move o foco', async ({ app, page }) => {
  await app.open('/login')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).click()
  const email = dialog.getByPlaceholder('contato@email.com', { exact: true })
  await expect(email).toBeFocused()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  const describedBy = await email.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  await expect(page.locator(`[id="${describedBy?.split(' ')[0]}"]`)).toHaveText(
    'Informe um e-mail válido',
  )
})

test('diálogo de zoom da galeria devolve o foco ao fechar', async ({ app, page }) => {
  await app.open('/nft/emerald-ape-042')
  const trigger = page.getByRole('button', { name: /Ampliar/ }).first()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
