import { expect, test } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

const SERVICE_PAGE = '/servicii/aplicatie-web'

test('header CTA on a service page sends a lead with that service and its stage', async ({ page }) => {
  let body: Record<string, unknown> | undefined
  await page.route('**/api/leads', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()

  const dialog = page.getByRole('dialog', { name: 'Spune-ne problema. O rezolvăm împreună.' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('#lead-name')).toBeFocused()
  await expect(dialog.getByRole('button', { name: 'Aplicație web', pressed: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Design → cod' })).toHaveCount(0)

  await dialog.locator('#lead-name').fill('Ana Popescu')
  await dialog.locator('#lead-email').fill('ana@example.com')
  await dialog.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await dialog.locator('button[type="submit"]').click()

  await expect(dialog.getByText('Trimis. Primești un răspuns într-o zi lucrătoare.')).toBeVisible()
  expect(body).toMatchObject({
    name: 'Ana Popescu',
    email: 'ana@example.com',
    service: 'web-app',
    stage: 'A',
    lang: 'ro',
    page: SERVICE_PAGE,
    website: '',
  })
})

test('empty submit shows the required-field errors and makes no request', async ({ page }) => {
  let requested = false
  await page.route('**/api/leads', async (route) => {
    requested = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('button[type="submit"]').click()

  await expect(dialog.locator('#lead-name-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#lead-email-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#lead-message-error')).toHaveText('Câmp obligatoriu.')
  expect(requested).toBe(false)
})

test('Tab stays inside the dialog and Escape closes it, returning focus to the CTA', async ({ page }) => {
  await page.goto(SERVICE_PAGE)
  await dismissConsentBanner(page)
  const cta = page.locator('header').getByRole('button', { name: /Discută un proiect/ })
  await cta.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('#lead-name')).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Închide' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('button[type="submit"]')).toBeFocused()
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(cta).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('on the homepage the header CTA scrolls to the contact section instead of opening the dialog', async ({ page }) => {
  await page.goto('/')
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('link', { name: /Discută un proiect/ }).click()
  await expect(page).toHaveURL(/#contact$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
