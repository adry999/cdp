import { expect, test } from '@playwright/test'
import { dismissConsentBanner, pinLocale } from './support/helpers'

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

test('RO empty submit shows the required-field errors and makes no request', async ({ page }) => {
  let requested = false
  await page.route('**/api/leads', async (route) => {
    requested = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/')
  await dismissConsentBanner(page)
  await page.locator('form button[type="submit"]').click()

  await expect(page.locator('#lead-name-error')).toHaveText('Câmp obligatoriu.')
  await expect(page.locator('#lead-email-error')).toHaveText('Câmp obligatoriu.')
  await expect(page.locator('#lead-message-error')).toHaveText('Câmp obligatoriu.')
  expect(requested).toBe(false)
})

test('RO valid submission posts the payload and shows the success message', async ({ page }) => {
  let body: unknown
  await page.route('**/api/leads', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/')
  await dismissConsentBanner(page)
  await page.locator('#lead-name').fill('Ana Popescu')
  await page.locator('#lead-email').fill('ana@example.com')
  await page.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await page.locator('form button[type="submit"]').click()

  await expect(page.getByText('Trimis. Primești un răspuns într-o zi lucrătoare.')).toBeVisible()
  expect(body).toMatchObject({
    name: 'Ana Popescu',
    email: 'ana@example.com',
    message: 'Vrem un portal pentru clienți.',
    lang: 'ro',
    page: '/',
    website: '',
  })
})

test('RO server error shows the error message and keeps the form', async ({ page }) => {
  await page.route('**/api/leads', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' }),
    })
  })

  await page.goto('/')
  await dismissConsentBanner(page)
  await page.locator('#lead-name').fill('Ana Popescu')
  await page.locator('#lead-email').fill('ana@example.com')
  await page.locator('#lead-message').fill('Vrem un portal pentru clienți.')
  await page.locator('form button[type="submit"]').click()

  await expect(page.getByRole('alert')).toHaveText('Ceva n-a mers. Încearcă din nou sau scrie direct pe email.')
  await expect(page.locator('form')).toBeVisible()
})
