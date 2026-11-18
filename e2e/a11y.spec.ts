import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  fillCard,
  fillDeliveryAddress,
  gotoHome,
  openCheckout,
  selectPayment,
  submitOrder,
} from './fixtures'

/*
 * Decisões de produto registradas pelo desenvolvedor (fidelidade ao Figma):
 *
 * 1. O token `--text-label` segue o valor oficial do Figma (#8D8686,
 *    "base-label"), que não atende ao contraste mínimo WCAG 2 AA para texto
 *    pequeno (3,05–3,57:1 vs 4,5:1).
 * 2. O CTA amarelo ("CONFIRMAR PEDIDO" / primário) segue o Figma:
 *    rótulo #ffffff sobre #dbac2c (2,1:1).
 *
 * Estas isenções NÃO desligam a regra color-contrast: apenas os nós cujo
 * fgColor/bgColor bate exatamente nesses pares do Figma são isentos.
 * Qualquer outro contraste insuficiente — e qualquer outra violação axe —
 * continua quebrando o teste. Ver AGENTS.md / PRD_SPEC / TECH_SPEC (trade-offs).
 */
const FIGMA_BASE_LABEL = '#8d8686'
const FIGMA_CTA_BG = '#dbac2c'
const FIGMA_CTA_FG = '#ffffff'

interface AxeCheck {
  data?: { fgColor?: string; bgColor?: string }
}

interface AxeNode {
  all: AxeCheck[]
  any: AxeCheck[]
  none: AxeCheck[]
}

function isFigmaLiteralContrastNode(node: AxeNode): boolean {
  const checks = [...node.any, ...node.all, ...node.none]
  if (checks.length === 0) return false
  return checks.every((check) => {
    const fg = check.data?.fgColor?.toLowerCase()
    const bg = check.data?.bgColor?.toLowerCase()
    if (fg === FIGMA_BASE_LABEL) return true
    return fg === FIGMA_CTA_FG && bg === FIGMA_CTA_BG
  })
}

async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const violations = results.violations
    .map((violation) => ({
      ...violation,
      nodes:
        violation.id === 'color-contrast'
          ? violation.nodes.filter(
              (node) =>
                !isFigmaLiteralContrastNode(node as unknown as AxeNode),
            )
          : violation.nodes,
    }))
    .filter((violation) => violation.nodes.length > 0)

  expect(
    violations,
    violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.nodes
            .map((node) => node.target.join(' '))
            .join(' | ')}`,
      )
      .join('\n'),
  ).toEqual([])
}

test('home não possui violações de acessibilidade', async ({ page }) => {
  await gotoHome(page)
  await expectNoA11yViolations(page)
})

test('checkout com cartão não possui violações de acessibilidade', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'Cartão de Crédito')
  await fillCard(page)

  await expectNoA11yViolations(page)
})

test('confirmação do pedido não possui violações de acessibilidade', async ({
  page,
}) => {
  await gotoHome(page)
  await openCheckout(page)
  await fillDeliveryAddress(page)
  await selectPayment(page, 'PIX')
  await submitOrder(page)

  await expect(page).toHaveURL(/\/success$/, { timeout: 20_000 })
  await expect(
    page.getByRole('heading', { level: 1, name: 'Uhu! Pedido confirmado' }),
  ).toBeVisible()

  await expectNoA11yViolations(page)
})
