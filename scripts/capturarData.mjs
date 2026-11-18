import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = resolve(HERE, '../docs/screenshots')
const BASE_URL = process.env.SCREENSHOT_URL ?? 'http://localhost:4173'

const VIA_CEP = {
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

const BRASIL_API = {
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

await mkdir(OUTPUT_DIR, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 1280, height: 1500 },
  locale: 'pt-BR',
  timezoneId: 'America/Sao_Paulo',
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
})
const page = await context.newPage()

await page.addInitScript(() => {
  window.localStorage.clear()
})
await page.route('https://viacep.com.br/**', (route) =>
  route.fulfill({ json: VIA_CEP }),
)
await page.route('https://brasilapi.com.br/**', (route) =>
  route.fulfill({ json: BRASIL_API }),
)
await page.route('https://nominatim.openstreetmap.org/**', (route) =>
  route.fulfill({ json: [] }),
)

async function settle() {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
}

async function capture(name, width, height, options = {}) {
  await page.setViewportSize({ width, height })
  await page.evaluate(() => window.scrollTo(0, 0))
  await settle()
  await page.screenshot({
    path: resolve(OUTPUT_DIR, name),
    type: 'jpeg',
    quality: 90,
    fullPage: options.fullPage ?? false,
  })
  console.log('captured', name)
}

async function waitForToastToClear() {
  await page
    .getByText('Adicionado ao carrinho', { exact: true })
    .waitFor({ state: 'hidden', timeout: 10_000 })
}

await page.goto(`${BASE_URL}/`)
await page.getByRole('heading', { level: 1 }).waitFor()
await settle()
await capture('home-desktop-light.jpg', 1280, 1500)

await page.getByRole('button', { name: 'Ativar tema escuro' }).click()
await settle()
await capture('home-desktop-dark.jpg', 1280, 1500)

await page.getByRole('button', { name: 'Ativar tema claro' }).click()
await settle()
await capture('home-mobile-light.jpg', 375, 812)

await page.getByRole('button', { name: 'Ativar tema escuro' }).click()
await settle()
await capture('home-mobile-dark.jpg', 375, 812)

await page.getByRole('button', { name: 'Ativar tema claro' }).click()
await settle()

await page.setViewportSize({ width: 1280, height: 1500 })
await page
  .getByRole('button', { name: 'Adicionar Expresso Tradicional ao carrinho' })
  .click()
await page.getByRole('link', { name: /Carrinho de compras/ }).click()
await page.getByLabel('CEP', { exact: true }).fill('90020008')
await page.getByText(/Chega em/).first().waitFor()
await page.getByLabel('Número', { exact: true }).fill('1500')
await page.getByLabel('Número', { exact: true }).blur()

await page.getByText('Cartão de Crédito', { exact: true }).click()
await page.getByLabel('Número do cartão').fill('4242 4242 4242 4242')
await page.getByLabel('Nome impresso no cartão').fill('ANA SILVA')
await page.getByLabel('Validade').fill('12/40')
await page.getByLabel('CVV').fill('123')
await page.getByLabel('Parcelas').selectOption('3')
await waitForToastToClear()
await settle()
await capture('checkout-desktop-light.jpg', 1280, 1500)

await capture('checkout-mobile-light.jpg', 375, 2300, { fullPage: true })

await page.setViewportSize({ width: 1280, height: 1500 })
await page.getByText('PIX', { exact: true }).click()
await settle()
await capture('checkout-pix-desktop-light.jpg', 1280, 1500)

await page.getByText('Cartão de Crédito', { exact: true }).click()
await page.getByLabel('Número do cartão').fill('4242 4242 4242 4242')
await page.getByLabel('Nome impresso no cartão').fill('ANA SILVA')
await page.getByLabel('Validade').fill('12/40')
await page.getByLabel('CVV').fill('123')
await page.getByRole('button', { name: /Pagar/ }).click()
await page.waitForURL(/\/success$/, { timeout: 20_000 })
await page.getByRole('heading', { level: 1 }).waitFor()
await settle()
await capture('success-desktop-light.jpg', 1280, 1200)
await capture('success-mobile-light.jpg', 375, 2100, { fullPage: true })

await browser.close()
console.log('screenshots ready in', OUTPUT_DIR)
