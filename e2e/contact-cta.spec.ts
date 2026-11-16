import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

// Contact buttons inside a page open the contact dialog in place (qualifier flag off), with the
// page's service pre-selected, instead of sending the visitor to the homepage or /contact.

const DIALOG_NAME = 'Spune-ne problema. O rezolvăm împreună.'

// The service chips of the contact form, as named in ro.json.
const SERVICE_CHIPS: Record<string, string> = {
  website: 'Website',
  'web-app': 'Aplicație web',
  wordpress: 'WordPress',
  shopify: 'Shopify',
  'ai-automation': 'Automatizare cu AI',
  granturi: 'Proiecte finanțate prin granturi',
}

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

async function visit(page: Page, path: string) {
  await page.goto(path)
  await dismissConsentBanner(page)
}

async function expectDialogInPlace(page: Page, path: string, service: string | null) {
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('#lead-name')).toBeFocused()
  // Exactly one chip is pressed: the service, or "Nu știu încă" when the page has none.
  const pressed = dialog.getByRole('group', { name: 'Serviciu' }).getByRole('button', { pressed: true })
  await expect(pressed).toHaveText(service ?? 'Nu știu încă')
  expect(new URL(page.url()).pathname).toBe(path)
  expect(new URL(page.url()).hash).toBe('')
  return dialog
}

// A published project with a service, read from the API so the suite follows the real data.
async function projectWithService(request: APIRequestContext) {
  const res = await request.get('/api/projects')
  const projects = (await res.json()) as { slug_ro: string; service_tag: string | null }[]
  const project = projects.find((row) => row.service_tag && SERVICE_CHIPS[row.service_tag])
  test.skip(!project, 'No published project with a service to test against')
  return project as { slug_ro: string; service_tag: string }
}

test('the service page button opens the dialog with that service and stays on the page', async ({ page }) => {
  const path = '/servicii/aplicatie-web'
  await visit(page, path)
  const button = page.locator('main').getByRole('link', { name: 'Începe un proiect' })
  // Without JavaScript the link still reaches a contact form.
  await expect(button).toHaveAttribute('href', '/contact')
  await button.click()
  const dialog = await expectDialogInPlace(page, path, 'Aplicație web')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(button).toBeFocused()
})

test('the stage buttons on /servicii pre-select the stage service when there is one', async ({ page }) => {
  await visit(page, '/servicii')
  await page.locator('main').getByRole('link', { name: 'Automatizează-mi fluxul' }).click()
  await expectDialogInPlace(page, '/servicii', 'Automatizare cu AI')
})

test('the closing button on /servicii opens the dialog with no service', async ({ page }) => {
  await visit(page, '/servicii')
  await page.locator('main').getByRole('link', { name: 'Vezi dacă te putem ajuta' }).click()
  await expectDialogInPlace(page, '/servicii', null)
})

test('the case-study button opens the dialog with the project service', async ({ page, request }) => {
  const project = await projectWithService(request)
  const path = `/proiecte/${project.slug_ro}`
  await visit(page, path)
  await page.locator('main').getByRole('link', { name: 'Hai să discutăm' }).click()
  await expectDialogInPlace(page, path, SERVICE_CHIPS[project.service_tag] ?? '')
})

test('a case-study link to the homepage contact section opens the dialog instead', async ({ page, request }) => {
  const res = await request.get('/api/projects')
  const projects = (await res.json()) as { slug_ro: string }[]
  let found: { slug: string; service: string | null } | undefined
  for (const { slug_ro } of projects) {
    const detail = (await (await request.get(`/api/projects/${slug_ro}`)).json()) as {
      service_tag: string | null
      links?: { url: string }[]
    }
    if (detail.links?.some((link) => link.url === '/#contact')) {
      found = { slug: slug_ro, service: detail.service_tag }
      break
    }
  }
  test.skip(!found, 'No published project links to the contact section')
  if (!found) return

  const path = `/proiecte/${found.slug}`
  await visit(page, path)
  const link = page.locator('main a[href="/#contact"]').first()
  await link.click()
  await expectDialogInPlace(page, path, found.service ? (SERVICE_CHIPS[found.service] ?? null) : null)
})

test('the pricing stage buttons open the dialog in place with the stage service', async ({ page }) => {
  await visit(page, '/preturi')
  const stages = page.locator('#stages')

  await stages.getByRole('link', { name: 'Transformă designul în cod' }).click()
  let dialog = await expectDialogInPlace(page, '/preturi', 'Aplicație web')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  // An express page can be a website, WordPress or Shopify: no single service to pre-select.
  await stages.getByRole('link', { name: 'Lansează pagina' }).click()
  dialog = await expectDialogInPlace(page, '/preturi', null)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.locator('#oferta').getByRole('link', { name: 'Cere o discuție' }).click()
  await expectDialogInPlace(page, '/preturi', null)
})

test('on the homepage the stack note links to the contact section', async ({ page }) => {
  await page.goto('/')
  const link = page.locator('#stack').getByRole('link', { name: 'ne auzim la un apel sau pe email' })
  await expect(link).toHaveAttribute('href', '/#contact')
})

test('on /contact the form starts on the first screen of a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/contact')
  const box = await page.locator('#lead-name').boundingBox()
  expect(box).not.toBeNull()
  expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(844)
})
