import { expect, test, users } from './support/fixtures.ts'

const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

test.beforeEach(async ({ app }) => {
  await app.open('/')
  await app.login(users.ana)
  await app.goto('/profile')
})

test('edição de perfil com validação', async ({ app, page }) => {
  const displayName = page.getByLabel(/Nome de exibição/)
  await displayName.fill('')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(displayName).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Informe seu nome de exibição')).toBeVisible()

  await page.getByLabel(/Nome de usuário/).fill('bruno.art')
  await displayName.fill('Ana Souza')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Este nome de usuário já está em uso.')).toBeVisible()

  await page.getByLabel(/Nome de usuário/).fill('ana.souza')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Perfil atualizado.')).toBeVisible()
  await expect(app.accountButton()).toHaveAccessibleName('Conta de Ana Souza')
  await page.reload()
  await app.ready()
  await expect(page.getByLabel(/Nome de usuário/)).toHaveValue('ana.souza')
})

test('avatar valida o arquivo, atualiza e remove', async ({ page }) => {
  const input = page.getByLabel('Escolher imagem do avatar')
  await input.setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('x') })
  await expect(page.getByRole('alert')).toHaveText('Use uma imagem PNG, JPG ou WebP.')

  await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: pixel })
  await expect(page.getByRole('img', { name: 'Seu avatar' })).toBeVisible()
  await page.getByRole('button', { name: 'Remover', exact: true }).click()
  await expect(page.getByRole('img', { name: 'Seu avatar' })).toHaveCount(0)
  await expect(page.getByRole('img', { name: 'Sem avatar' })).toBeVisible()
})

test('troca de senha com erros e novo login', async ({ app, page }) => {
  await page.getByLabel('Senha atual').fill('errada000')
  await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha123')
  await page.getByLabel('Confirmar nova senha').fill('outraSenha123')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('As senhas não conferem')).toBeVisible()

  await page.getByLabel('Confirmar nova senha').fill('novaSenha123')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('A senha atual está incorreta.')).toBeVisible()

  await page.getByLabel('Senha atual').fill(users.ana.password)
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByText('Senha alterada.')).toBeVisible()

  await app.logout()
  await app.goto('/login')
  await app.loginViaForm(users.ana)
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  await app.loginViaForm({ ...users.ana, password: 'novaSenha123' })
  await expect(app.accountButton()).toBeVisible()
})

test('carteiras principal e secundária com validação', async ({ app, page }) => {
  await app.goto('/wallets')
  const primary = page.getByRole('region', { name: 'Carteira principal' })
  await primary.getByLabel(/Código de indicação/).fill('abc')
  await primary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(primary.getByText('Use de 6 a 12 letras maiúsculas ou números')).toBeVisible()
  await primary.getByLabel(/Código de indicação/).fill('KURIOANA')
  await primary.getByLabel(/Apelido da carteira/).fill('Principal')
  await primary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByText('Carteira principal salva.')).toBeVisible()

  const secondary = page.getByRole('region', { name: 'Carteira secundária' })
  await secondary.getByLabel('Igual à carteira principal').check()
  await secondary.getByRole('button', { name: 'Adicionar' }).click()
  await expect(secondary.getByLabel(/Nome de exibição/)).toHaveValue('Ana Colecionadora')
  await secondary.getByLabel(/Apelido da carteira/).fill('Reserva')
  await secondary
    .getByLabel(/Endereço da carteira/)
    .fill('0xA91F3c2b7D4e5F60718293a4B5c6D7e8F9012E82')
  await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(secondary.getByText('Este endereço já está cadastrado.').first()).toBeVisible()

  await secondary
    .getByLabel(/Endereço da carteira/)
    .fill('0xB000000000000000000000000000000000000001')
  await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByText('Carteira secundária salva.')).toBeVisible()

  await page.reload()
  await app.ready()
  await expect(
    page.getByRole('region', { name: 'Carteira secundária' }).getByLabel(/Apelido da carteira/),
  ).toHaveValue('Reserva')
  await expect(
    page.getByRole('region', { name: 'Carteira principal' }).getByLabel(/Apelido da carteira/),
  ).toHaveValue('Principal')
})
