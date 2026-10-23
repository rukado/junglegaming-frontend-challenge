import { expect, test, users } from './support/fixtures.ts'

test(
  'compra completa do catálogo ao recibo confirmado',
  { tag: '@mobile' },
  async ({ app, page }) => {
    await app.open('/')
    await app.login(users.ana)

    await app.catalog().getByRole('link', { name: 'Neon Vessel #552' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Neon Vessel #552' })).toBeVisible()
    await (
      app.isMobile
        ? page.getByRole('button', { name: 'Comprar NFT' })
        : page.getByRole('button', { name: 'COMPRAR' })
    ).click()
    await expect(page).toHaveURL('/cart')

    await page.getByRole('link', { name: 'Conectar e finalizar' }).click()
    await expect(page).toHaveURL('/checkout')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    const review = page.getByRole('dialog', { name: 'Revise sua compra' })
    await expect(review).toContainText('Neon Vessel #552 (x 1)')
    await expect(review).toContainText('1.906 ETH')
    await review.getByRole('button', { name: 'Confirmar e assinar' }).click()

    await expect(page).toHaveURL(/\/orders\/ord_/)
    const receipt = page.getByRole('dialog', { name: 'Compra confirmada' })
    await expect(
      receipt.getByText('Seus NFTs agora estão na sua carteira', { exact: true }),
    ).toBeVisible()
    await expect(receipt).toContainText('Neon Vessel #552')
    await expect(receipt).toContainText('Transação confirmada na Ethereum.')
    await expect(receipt.getByRole('link', { name: /Ver no Etherscan/ })).toHaveAttribute(
      'href',
      /explorer\.kurio\.local\/tx\/0x/,
    )

    const orders = await app.mocks().orders()
    expect(orders).toHaveLength(1)
    expect(orders[0]?.status).toBe('confirmed')

    await receipt.getByRole('button', { name: 'Fechar' }).click()
    await expect(page).toHaveURL('/')
    await app.goto('/cart')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  },
)
