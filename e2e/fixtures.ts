import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const NEAR_CEP = '90020008'
export const FAR_CEP = '01310100'
export const APPROVED_CARD = '4242 4242 4242 4242'
export const DECLINED_CARD = '4000 0000 0000 0002'
export const CARDHOLDER_NAME = 'ANA SILVA'
export const CARD_EXPIRY = '12/40'
export const CARD_CVV = '123'

const VIA_CEP_NEAR = {
  cep: '90020-008',
  logradouro: 'Rua dos Andradas',
  complemento: '',
  unidade: '',
  bairro: 'Centro Histórico',
  localidade: 'Porto Alegre',
  uf: 'RS',
  ibge: '4314902',
  gia: '',
  ddd: '51',
  siafi: '8801',
}

const VIA_CEP_FAR = {
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  complemento: '',
  unidade: '',
  bairro: 'Bela Vista',
  localidade: 'São Paulo',
  uf: 'SP',
  ibge: '3550308',
  gia: '1004',
  ddd: '11',
  siafi: '7107',
}

const BRASIL_API_NEAR = {
  cep: '90020008',
  state: 'RS',
  city: 'Porto Alegre',
  neighborhood: 'Centro Histórico',
  street: 'Rua dos Andradas',
  location: {
    type: 'Point',
    coordinates: { longitude: '-51.23019', latitude: '-30.03283' },
  },
}

const BRASIL_API_FAR = {
  cep: '01310100',
  state: 'SP',
  city: 'São Paulo',
  neighborhood: 'Bela Vista',
  street: 'Avenida Paulista',
  location: {
    type: 'Point',
    coordinates: { longitude: '-46.6553299', latitude: '-23.5617698' },
  },
}

/**
 * Keeps the suite deterministic and offline: ViaCEP, BrasilAPI and Nominatim
 * are mocked with real payload shapes, and web fonts are replaced by a no-op
 * stylesheet so text metrics stay stable.
 */
export async function mockExternalApis(page: Page): Promise<void> {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  )
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort())

  await page.route(
    /https:\/\/viacep\.com\.br\/ws\/\d{8}\/json\/?/,
    (route) => {
      const isFar = route.request().url().includes(FAR_CEP)
      return route.fulfill({ json: isFar ? VIA_CEP_FAR : VIA_CEP_NEAR })
    },
  )

  await page.route(
    /https:\/\/brasilapi\.com\.br\/api\/cep\/v2\/\d{8}/,
    (route) => {
      const isFar = route.request().url().includes(FAR_CEP)
      return route.fulfill({ json: isFar ? BRASIL_API_FAR : BRASIL_API_NEAR })
    },
  )

  await page.route('https://nominatim.openstreetmap.org/**', (route) =>
    route.fulfill({ json: [] }),
  )
}

export async function gotoHome(page: Page): Promise<void> {
  await mockExternalApis(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Encontre o café perfeito/,
    }),
  ).toBeVisible()
}

export async function addCoffee(
  page: Page,
  name = 'Expresso Tradicional',
): Promise<void> {
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name, exact: true }) })

  await card
    .getByRole('button', { name: `Adicionar ${name} ao carrinho` })
    .click()
}

export async function openCheckout(page: Page): Promise<void> {
  await addCoffee(page)
  await page.getByRole('link', { name: /Carrinho de compras/ }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Complete seu pedido' }),
  ).toBeVisible()
}

export async function selectPayment(
  page: Page,
  label: 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Dinheiro',
): Promise<void> {
  await page.getByText(label, { exact: true }).click()
}

export async function fillDeliveryAddress(
  page: Page,
  cep: string = NEAR_CEP,
): Promise<void> {
  await page.getByLabel('CEP', { exact: true }).fill(cep)

  if (cep === NEAR_CEP) {
    await expect(page.getByText(/Chega em/).first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByLabel('Rua', { exact: true })).toHaveValue(
      'Rua dos Andradas',
    )
  } else {
    await expect(page.getByText(/Fora da área de entrega/).first()).toBeVisible(
      { timeout: 15_000 },
    )
  }

  await page.getByLabel('Número', { exact: true }).fill('1500')
}

export async function fillCard(
  page: Page,
  cardNumber = APPROVED_CARD,
): Promise<void> {
  await page.getByLabel('Número do cartão').fill(cardNumber)
  await page.getByLabel('Nome impresso no cartão').fill(CARDHOLDER_NAME)
  await page.getByLabel('Validade').fill(CARD_EXPIRY)
  await page.getByLabel('CVV').fill(CARD_CVV)
}

export async function submitOrder(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^(Pagar|Finalizar pedido)/ }).click()
}
