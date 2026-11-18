import { expect, test } from '@playwright/test'
import { addCoffee, gotoHome } from './fixtures'

test('home exibe o hero, os 14 cafés e o toast de adição ao carrinho', async ({
  page,
}) => {
  await gotoHome(page)

  await expect(
    page.getByRole('img', { name: /Copo de café do Coffee Delivery/ }),
  ).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(14)

  await addCoffee(page)

  await expect(
    page.getByText('Adicionado ao carrinho', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('1 unidade de Expresso Tradicional'),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Carrinho de compras, 1 item' }),
  ).toBeVisible()
})

test('filtro por categoria reduz o catálogo e pode ser limpo', async ({
  page,
}) => {
  await gotoHome(page)

  await page.getByRole('button', { name: 'Gelado', exact: true }).click()

  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(
    page.getByRole('button', { name: 'Gelado', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(14)
})

test('tema escuro é aplicado e persiste após recarregar', async ({ page }) => {
  await gotoHome(page)

  await page.getByRole('button', { name: 'Ativar tema escuro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(
    page.getByRole('button', { name: 'Ativar tema claro' }),
  ).toBeVisible()

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('quantidade escolhida é somada no carrinho', async ({ page }) => {
  await gotoHome(page)

  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Latte', exact: true }) })

  await card.getByRole('button', { name: 'Aumentar quantidade de Latte' }).click()
  await card.getByRole('button', { name: 'Aumentar quantidade de Latte' }).click()
  await card.getByRole('button', { name: 'Adicionar Latte ao carrinho' }).click()

  await expect(
    page.getByRole('link', { name: 'Carrinho de compras, 3 itens' }),
  ).toBeVisible()
  await expect(page.getByText('3 unidades de Latte')).toBeVisible()
})
