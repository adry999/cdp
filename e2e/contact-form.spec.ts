import { expect, test, type Page } from '@playwright/test'
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

  // The same confirmation as the dialog: the sentence and the three next steps, without a Close button.
  const confirmation = page.locator('#contact').getByRole('status')
  await expect(confirmation).toContainText('Mulțumim! Primești un răspuns într-o zi lucrătoare.')
  await expect(confirmation.locator('li')).toHaveCount(3)
  await expect(confirmation.getByRole('button')).toHaveCount(0)
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

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Ceva n-a mers. Încearcă din nou sau scrie direct pe email.')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:.+@.+/)
  await expect(page.locator('form')).toBeVisible()
  await expect(page.locator('#lead-name')).toHaveValue('Ana Popescu')
  await expect(page.locator('#lead-message')).toHaveValue('Vrem un portal pentru clienți.')
})

async function fillValid(page: Page) {
  await page.locator('#lead-name').fill('Ana Popescu')
  await page.locator('#lead-email').fill('ana@example.com')
  await page.locator('#lead-message').fill('Vrem un portal pentru clienți.')
}

test('RO rate limit (429) shows its own message with the email address', async ({ page }) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ statusCode: 429 }) }),
  )
  await page.goto('/')
  await dismissConsentBanner(page)
  await fillValid(page)
  await page.locator('form button[type="submit"]').click()

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Prea multe încercări. Încearcă din nou peste câteva minute.')
  await expect(alert).not.toContainText('Ceva n-a mers')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:.+@.+/)
})

test('EN dropped connection shows the generic failure with the email address', async ({ page, context }) => {
  await pinLocale(context, 'en')
  await page.route('**/api/leads', (route) => route.abort('connectionreset'))
  await page.goto('/en')
  await page.getByRole('button', { name: 'Necessary only' }).click()
  await fillValid(page)
  await page.locator('form button[type="submit"]').click()

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Something went wrong. Try again or email us directly.')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:.+@.+/)
})

test('an invalid field gets the signal border and its error clears while typing', async ({ page }) => {
  await page.goto('/')
  await dismissConsentBanner(page)
  const name = page.locator('#lead-name')
  const email = page.locator('#lead-email')
  const normalBorder = await name.evaluate((el) => getComputedStyle(el).borderTopColor)

  await page.locator('form button[type="submit"]').click()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toHaveCSS('border-top-color', 'rgb(255, 77, 20)')

  await name.fill('Ana')
  await expect(name).not.toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#lead-name-error')).toHaveCount(0)
  await expect(name).toHaveCSS('border-top-color', normalBorder)

  await email.fill('ana')
  await expect(page.locator('#lead-email-error')).toHaveText('Adresă de email invalidă.')
  await email.fill('ana@example.com')
  await expect(page.locator('#lead-email-error')).toHaveCount(0)
  await expect(page.locator('#lead-message-error')).toHaveText('Câmp obligatoriu.')
})

test('the submit button keeps its width while sending', async ({ page }) => {
  let release: () => void = () => {}
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/leads', async (route) => {
    await held
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
  await page.goto('/')
  await dismissConsentBanner(page)
  await fillValid(page)
  const submit = page.locator('form button[type="submit"]')
  const before = await submit.boundingBox()

  await submit.click()
  await expect(submit).toHaveAttribute('aria-disabled', 'true')
  await expect(submit).toHaveAccessibleName('Se trimite…')
  const during = await submit.boundingBox()
  expect(during?.width).toBe(before?.width)
  release()
  await expect(page.locator('#contact').getByRole('status')).toBeVisible()
})

test('/contact shows the shared confirmation after a send', async ({ page }) => {
  await page.route('**/api/leads', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }),
  )
  await page.goto('/contact')
  await dismissConsentBanner(page)
  const privacy = page.locator('form').getByRole('link', { name: /politica de confidențialitate/ })
  await expect(privacy).toHaveAttribute('target', '_blank')
  await fillValid(page)
  await page.locator('form button[type="submit"]').click()

  const confirmation = page.getByRole('status').filter({ hasText: 'Mulțumim!' })
  await expect(confirmation).toBeVisible()
  await expect(confirmation.locator('li')).toHaveCount(3)
  await expect(confirmation.getByRole('button')).toHaveCount(0)
  await expect(page.getByText('Mulțumim! Primești un răspuns într-o zi lucrătoare.')).toBeFocused()
})
