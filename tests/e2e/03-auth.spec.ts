import { expect, test, users } from './support/fixtures.ts'

test('cadastro com validação, conflito e sucesso', async ({ app, page }) => {
  await app.open('/register')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Criar conta' }).click()
  await expect(dialog.getByRole('textbox', { name: 'Nome de usuário' })).toHaveAttribute(
    'aria-invalid',
    'true',
  )

  await dialog.getByRole('textbox', { name: 'Nome de usuário' }).fill('nova.colecionadora')
  await dialog.getByRole('textbox', { name: 'E-mail' }).fill(users.ana.email)
  await dialog.getByRole('textbox', { name: 'Senha', exact: true }).fill('segura123')
  await dialog.getByRole('textbox', { name: 'Confirmar senha' }).fill('segura123')
  await dialog.getByRole('button', { name: 'Criar conta' }).click()
  await expect(dialog.getByText('Este e-mail já está cadastrado.')).toBeVisible()

  await dialog.getByRole('textbox', { name: 'E-mail' }).fill('nova@kurio.dev')
  await dialog.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL('/')
  await expect(app.accountButton()).toHaveAccessibleName('Conta de nova.colecionadora')
})

test('login com erro, sucesso e retorno à rota protegida', async ({ app, page }) => {
  await app.open('/profile')
  await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile&reason=required/)
  await expect(page.getByText('Entre na sua conta para continuar.')).toBeVisible()

  await app.loginViaForm({ ...users.ana, password: 'senhaerrada1' })
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()

  await app.loginViaForm(users.ana)
  await expect(page).toHaveURL('/profile')
  await expect(app.accountButton()).toHaveAccessibleName(`Conta de ${users.ana.name}`)
})

test('sessão expirada redireciona preservando o destino', async ({ app, page }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.goto('/profile')
  await app.mocks().expireSessions()
  await page.getByRole('link', { name: 'Carteiras' }).first().click()
  await expect(page).toHaveURL(/\/login\?.*reason=expired/)
  await expect(
    page.getByText('Sua sessão expirou. Entre novamente para continuar de onde parou.'),
  ).toBeVisible()

  await app.loginViaForm(users.ana)
  await expect(page).toHaveURL(/\/(wallets|profile)/)
})

test('logout e troca de usuário não vazam dados', { tag: '@mobile' }, async ({ app, page }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.goto('/favorites')
  await expect(page.getByRole('article')).toHaveCount(2)
  await app.addToCart('neon-vessel-552')
  await expect(app.visible(page.getByRole('link', { name: 'Neon Vessel #552' }))).toHaveCount(1)

  await app.logout()
  await app.goto('/favorites')
  await expect(page).toHaveURL(/\/login/)

  await app.loginViaForm(users.bruno)
  await expect(page).toHaveURL('/favorites')
  await expect(page.getByText('Nenhum NFT na sua lista')).toBeVisible()
  await app.goto('/cart')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  await expect(page.getByText('Neon Vessel #552')).toHaveCount(0)
})
