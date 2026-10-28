import { expect, test, type Page } from '@playwright/test'
import { dismissConsentBanner, firstPublishedProject, pinLocale } from './support/helpers'

const DIALOG_NAME = 'Hai să găsim punctul de pornire potrivit.'
const DIALOG_NAME_EN = "Let's find the right starting point."

test.beforeEach(async ({ context }) => {
  await pinLocale(context)
})

async function visitHome(page: Page) {
  await page.goto('/')
  await dismissConsentBanner(page)
}

async function openFromHero(page: Page) {
  await visitHome(page)
  const trigger = page.locator('#top').getByRole('button', { name: 'Vezi dacă te putem ajuta' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()
  return { trigger, dialog }
}

async function reachContactStep(page: Page) {
  const { dialog } = await openFromHero(page)
  await dialog.getByText('Am fișiere Figma sau resurse de design gata.').click()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await dialog.getByText('2.000 – 5.000 EUR').click()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await expect(dialog.getByText('Construcție full-stack din design-urile tale.')).toBeVisible()
  return dialog
}

test('hero CTA opens the dialog, traps Tab and returns focus on Escape', async ({ page }) => {
  const { trigger, dialog } = await openFromHero(page)
  const close = dialog.getByRole('button', { name: 'Închide' })
  await expect(close).toBeFocused()

  // "Continuă" is disabled until a stage is picked, so the last focusable
  // control on step 1 is the last stage option.
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('input[name="qualifier-stage"][value="D"]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('services timeline CTA opens the dialog with its stage preselected', async ({ page }) => {
  await visitHome(page)
  await page.locator('#servicii [role="tabpanel"]').getByRole('button').click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog.locator('input[name="qualifier-stage"][value="E"]')).toBeChecked()
  await expect(dialog.getByRole('button', { name: 'Continuă' })).toBeEnabled()
})

test('case-study CTA opens the dialog', async ({ page, request }) => {
  const project = await firstPublishedProject(request)
  await page.goto(`/proiecte/${project.slug_ro}`)
  await page.getByRole('button', { name: 'Doar necesare' }).click()
  const trigger = page.getByRole('button', { name: 'Hai să discutăm' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Închide' })).toBeFocused()
})

test('empty contact step shows required-field errors and sends nothing', async ({ page }) => {
  let requested = false
  await page.route('**/api/contact', async (route) => {
    requested = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  const dialog = await reachContactStep(page)
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.locator('#qual-name-error')).toHaveText('Câmp obligatoriu.')
  await expect(dialog.locator('#qual-email-error')).toHaveText('Câmp obligatoriu.')
  expect(requested).toBe(false)
})

test('valid submission posts the qualification and shows the allocated route', async ({ page }) => {
  let body: unknown
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.locator('#qual-handle').fill('@ana')
  await dialog.locator('#qual-notes').fill('Vreau un site nou.')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.getByText('Mulțumim — am primit detaliile.')).toBeVisible()
  // Internal CRM routing labels stay out of the visitor-facing success screen.
  await expect(dialog.getByText('Custom Engineering / AI')).toHaveCount(0)
  await expect(dialog.getByText('Design-to-Code')).toHaveCount(0)
  expect(body).toEqual({
    stage: 'A',
    budget: '2to5k',
    name: 'Ana Pop',
    email: 'ana@example.com',
    handle: '@ana',
    notes: 'Vreau un site nou.',
    website: '',
    lang: 'ro',
  })
})

test('delivery failure keeps the contact step and shows the error', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 502, statusMessage: 'Could not deliver your request' }),
    })
  })

  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  await expect(dialog.getByRole('alert')).toHaveText('Ceva n-a mers. Încearcă din nou sau scrie direct pe email.')
  await expect(dialog.locator('#qual-name')).toBeVisible()
})

test('EN dialog opens from /en and posts the English locale', async ({ page, context }) => {
  await context.clearCookies()
  await pinLocale(context, 'en')
  let body: unknown
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/en')
  await page.getByRole('button', { name: 'Necessary only' }).click()
  const trigger = page.locator('#top').getByRole('button', { name: 'Find out if we can help' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME_EN })
  await expect(dialog).toBeVisible()

  await dialog.getByText('I have Figma files or design assets ready.').click()
  await dialog.getByRole('button', { name: 'Continue' }).click()
  await dialog.getByText('2,000 – 5,000 EUR').click()
  await dialog.getByRole('button', { name: 'Continue' }).click()
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Send request' }).click()

  await expect(dialog.getByText("Thanks — we've got your details.")).toBeVisible()
  expect((body as { lang: string }).lang).toBe('en')
})

test('POST /api/contact rejects an invalid body and fakes success for the honeypot', async ({ request }) => {
  const invalid = await request.post('/api/contact', { data: {} })
  expect(invalid.status()).toBe(400)

  const honeypot = await request.post('/api/contact', { data: { website: 'http://spam.example' } })
  expect(honeypot.status()).toBe(200)
  expect(await honeypot.json()).toEqual({ success: true })
})

test('POST /api/contact is not found while the qualifier flag is off', async ({ request }) => {
  const response = await request.post('http://localhost:3012/api/contact', { data: {} })
  expect(response.status()).toBe(404)
})

test('header CTA on a service page opens the dialog with that service stage preselected', async ({ page }) => {
  await page.goto('/servicii/aplicatie-web')
  await dismissConsentBanner(page)
  await page.locator('header').getByRole('button', { name: /Discută un proiect/ }).click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('input[name="qualifier-stage"][value="A"]')).toBeChecked()
})

test('qualifier opened from the mobile menu returns focus to the menu toggle on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/servicii/aplicatie-web')
  await dismissConsentBanner(page)
  const toggle = page.locator('header button[aria-controls="site-mobile-menu"]')
  await toggle.click()
  await page.locator('#site-mobile-menu').getByText(/Discută un proiect/).click()
  const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(toggle).toBeFocused()
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
})

test('focus moves into the new step after Continue and Back', async ({ page }) => {
  const { dialog } = await openFromHero(page)
  await dialog.getByText('Am fișiere Figma sau resurse de design gata.').click()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await expect(dialog.getByText('2.000 – 5.000 EUR')).toBeVisible()
  await expect(dialog.locator('fieldset legend')).toBeFocused()

  await dialog.getByRole('button', { name: 'Înapoi' }).click()
  await expect(dialog.locator('input[name="qualifier-stage"][value="D"]')).toBeVisible()
  await expect(dialog.locator('fieldset legend')).toBeFocused()
})
