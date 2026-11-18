import { expect, test } from '@playwright/test'
import {
  APPROVED_CARD,
  DECLINED_CARD,
  FAR_CEP,
  fillCard,
  fillDeliveryAddress,
  gotoHome,
  openCheckout,
  selectPayment,
  submitOrder,
} from './fixtures'

test('checkout no crédito calcula entrega por distância e aprova o pagamento', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)

  await expect(page.getByText(/Chega em 20–30 min/).first()).toBeVisible()
  await expect(page.getByText(/470 m da cafeteria/).first()).toBeVisible()
  await expect(page.getByText(/Taxa de entrega/)).toBeVisible()

  await selectPayment(page, 'Cartão de Crédito')
  await fillCard(page)
  await page.getByLabel('Parcelas').selectOption('3')
  await submitOrder(page)

  await expect(
    page.getByRole('dialog', { name: 'Processando pagamento' }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })

  await expect(
    page.getByRole('heading', { level: 1, name: 'Uhu! Pedido confirmado' }),
  ).toBeVisible()
  await expect(page.getByText('Pagamento aprovado')).toBeVisible()
  await expect(page.getByText(/Visa •••• 4242/)).toBeVisible()
  await expect(page.getByText(/3x/).first()).toBeVisible()
  await expect(page.getByText(/20–30 min/).first()).toBeVisible()
  await expect(page.getByText(/13,40/).first()).toBeVisible()
  await expect(page.getByText(/CD-/).first()).toBeVisible()
})

test('checkout no débito aprova com cartão e sem parcelas', async ({ page }) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'Cartão de Débito')
  await fillCard(page)
  await submitOrder(page)

  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })
  await expect(page.getByText('Pagamento aprovado')).toBeVisible()
  await expect(page.getByText(/Cartão de Débito/).first()).toBeVisible()
})

test('checkout com PIX exibe QR Code e confirma o pagamento', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'PIX')

  await expect(page.getByText('PIX copia e cola')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Copiar código PIX' }),
  ).toBeVisible()
  await expect(page.getByText(/COFFEE-DELIVERY-DEMO/)).toBeVisible()

  await submitOrder(page)

  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })
  await expect(page.getByText('Pagamento aprovado')).toBeVisible()
  await expect(page.getByText(/PIX/).first()).toBeVisible()
  await expect(page.getByText(/PAY-/).first()).toBeVisible()
})

test('checkout em dinheiro registra troco e pagamento na entrega', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'Dinheiro')

  await page.getByLabel('Troco para (opcional)').fill('5000')
  await expect(page.getByLabel('Troco para (opcional)')).toHaveValue(
    /R\$\s*50,00/,
  )

  await submitOrder(page)

  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })
  await expect(page.getByText('Pagamento na entrega')).toBeVisible()
  await expect(page.getByText(/Troco para R\$\s*50,00/)).toBeVisible()
})

test('cartão recusado mostra erro e permite tentar outro cartão', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'Cartão de Crédito')
  await fillCard(page, DECLINED_CARD)
  await submitOrder(page)

  await expect(
    page.getByRole('alert').filter({ hasText: /recusado pela emissora/ }),
  ).toBeVisible({ timeout: 20_000 })
  await expect(page).toHaveURL(/\/checkout$/)

  await fillCard(page, APPROVED_CARD)
  await submitOrder(page)

  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })
  await expect(page.getByText('Pagamento aprovado')).toBeVisible()
})

test('endereço fora da área bloqueia o pedido e explica o limite', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page, FAR_CEP)
  await selectPayment(page, 'PIX')

  await expect(page.getByText(/Fora da área de entrega/).first()).toBeVisible()
  await expect(page.getByText(/Entregamos até 12 km/).first()).toBeVisible()

  await page.getByRole('button', { name: 'Finalizar pedido' }).click()

  await expect(
    page.getByRole('alert').filter({
      hasText: /Informe um CEP com entrega disponível/,
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/checkout$/)
})

test('validação aponta campos obrigatórios e dados do cartão', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)

  await submitOrder(page)

  await expect(page.getByText('Informe o CEP', { exact: true })).toBeVisible()
  await expect(page.getByText('Informe a rua')).toBeVisible()
  await expect(page.getByText('Selecione a forma de pagamento')).toBeVisible()

  await fillDeliveryAddress(page)
  await selectPayment(page, 'Cartão de Crédito')
  await submitOrder(page)

  await expect(page.getByText('Informe o número do cartão')).toBeVisible()
  await expect(
    page.getByText('Informe o nome impresso no cartão'),
  ).toBeVisible()
  await expect(page.getByText('Use o formato MM/AA')).toBeVisible()
  await expect(page.getByText('Informe o CVV com 3 ou 4 dígitos')).toBeVisible()
  await expect(page).toHaveURL(/\/checkout$/)
})
