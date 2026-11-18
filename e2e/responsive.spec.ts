import { expect, test } from '@playwright/test'
import {
  fillDeliveryAddress,
  gotoHome,
  openCheckout,
  selectPayment,
} from './fixtures'

const WIDTHS = [320, 375, 768, 1280] as const

for (const width of WIDTHS) {
  test(`sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await gotoHome(page)

    const homeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(homeOverflow).toBeLessThanOrEqual(width)

    await openCheckout(page)
    await fillDeliveryAddress(page)
    await selectPayment(page, 'PIX')

    const checkoutOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(checkoutOverflow).toBeLessThanOrEqual(width)
  })
}

test('formulário e resumo empilham no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)

  const formBox = await page
    .getByRole('heading', { level: 1, name: 'Complete seu pedido' })
    .boundingBox()
  const summaryBox = await page
    .getByRole('heading', { name: 'Cafés selecionados' })
    .boundingBox()

  expect(formBox).not.toBeNull()
  expect(summaryBox).not.toBeNull()

  if (formBox && summaryBox) {
    expect(summaryBox.y).toBeGreaterThan(formBox.y)
  }
})
