import { expect, test } from './support/fixtures.ts'

function parsePrices(texts: string[]) {
  return texts.map((text) => Number.parseFloat(text.replace(' ETH', '')))
}

test('busca, filtros combinados, ordenação, paginação e restauração pelo histórico', async ({
  app,
  page,
}) => {
  await app.open('/')
  const catalog = app.catalog()
  const status = catalog.getByText(/NFTs? encontrados?/)
  await expect(status).toHaveText('72 NFTs encontrados. Página 1 de 8.')

  await catalog.getByRole('combobox', { name: 'Ordenar por:' }).click()
  await page.getByRole('option', { name: 'Menor preço' }).click()
  await expect(page).toHaveURL(/sort=price-asc/)
  const firstPage = parsePrices(await catalog.getByRole('article').locator('p').allTextContents())
  expect(firstPage).toEqual([...firstPage].sort((a, b) => a - b))

  await catalog.getByRole('link', { name: 'Página 2' }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(status).toHaveText('72 NFTs encontrados. Página 2 de 8.')
  await expect(catalog.getByRole('article').first().locator('p')).toHaveText('0.59 ETH')
  const secondPage = parsePrices(await catalog.getByRole('article').locator('p').allTextContents())
  expect(secondPage[0]).toBeGreaterThanOrEqual(firstPage.at(-1) ?? 0)

  await catalog.getByRole('checkbox', { name: /^Arte digital/ }).check()
  await catalog.getByRole('checkbox', { name: /^Ethereum/ }).check()
  await expect(page).toHaveURL(/categories=.*arte-digital/)
  await expect(page).toHaveURL(/networks=.*ethereum/)
  await expect(page).not.toHaveURL(/page=2/)
  await expect(status).toHaveText('10 NFTs encontrados. Página 1 de 2.')

  await catalog.getByRole('searchbox', { name: /Buscar NFTs/ }).fill('nomad')
  await expect(page).toHaveURL(/q=nomad/)
  await expect(status).toHaveText('2 NFTs encontrados. Página 1 de 1.')
  await expect(catalog.getByRole('heading', { level: 3 })).toHaveText([
    'Violet Nomad #314',
    'Sage Nomad #089',
  ])

  await page.reload()
  await app.ready()
  await expect(status).toHaveText('2 NFTs encontrados. Página 1 de 1.')
  await expect(catalog.getByRole('searchbox', { name: /Buscar NFTs/ })).toHaveValue('nomad')

  await page.goBack()
  await expect(page).not.toHaveURL(/q=nomad/)
  await expect(status).toHaveText('10 NFTs encontrados. Página 1 de 2.')
  await expect(catalog.getByRole('checkbox', { name: /^Arte digital/ })).toBeChecked()
  await expect(catalog.getByRole('searchbox', { name: /Buscar NFTs/ })).toHaveValue('')

  await page.goBack()
  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect(status).toHaveText('72 NFTs encontrados. Página 2 de 8.')
  await expect(catalog.getByRole('checkbox', { name: /^Arte digital/ })).not.toBeChecked()
})

test('busca com debounce controlado pelo relógio', async ({ app, page }) => {
  await app.open('/')
  await page.clock.install()
  const search = app.catalog().getByRole('searchbox', { name: /Buscar NFTs/ })
  await search.fill('ape')
  await page.clock.runFor(200)
  await expect(page).not.toHaveURL(/q=ape/)
  await page.clock.runFor(200)
  await expect(page).toHaveURL(/q=ape/)
})

test('catálogo vazio mostra estado sem resultados', async ({ app }) => {
  await app.open('/', 'empty-catalog')
  await expect(app.catalog().getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
})
