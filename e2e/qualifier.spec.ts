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
    // Where the modal was opened, stored with the lead so the admin sees its source.
    page: '/',
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

  // The block also carries the address to write to (see the mailto test below).
  await expect(dialog.getByRole('alert')).toContainText('Ceva n-a mers. Încearcă din nou sau scrie direct pe email.')
  await expect(dialog.locator('#qual-name')).toHaveValue('Ana Pop')
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

test('the close button is a full touch target on a phone and on a desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { trigger, dialog } = await openFromHero(page)
  const close = dialog.getByRole('button', { name: 'Închide' })
  let box = await close.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)

  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 1440, height: 900 })
  await trigger.click()
  box = await close.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(32)
  expect(box?.height).toBeGreaterThanOrEqual(32)
})

test('closing and reopening keeps the step, the choices and the typed contact fields', async ({ page }) => {
  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.locator('#qual-notes').fill('Vreau un site nou.')

  // A click on the backdrop closes the dialog; nothing typed is lost.
  await page.mouse.click(5, 5)
  await expect(dialog).toBeHidden()
  await page.locator('#top').getByRole('button', { name: 'Vezi dacă te putem ajuta' }).click()
  await expect(dialog.getByText('Pasul 3 din 3')).toBeVisible()
  await expect(dialog.locator('#qual-name')).toHaveValue('Ana Pop')
  await expect(dialog.locator('#qual-email')).toHaveValue('ana@example.com')
  await expect(dialog.locator('#qual-notes')).toHaveValue('Vreau un site nou.')

  // A button for another stage lands on step 1 with that stage chosen; budget and fields stay.
  await page.keyboard.press('Escape')
  await page.locator('#servicii [role="tabpanel"]').getByRole('button').click()
  await expect(dialog.locator('input[name="qualifier-stage"][value="E"]')).toBeChecked()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await expect(dialog.locator('input[name="qualifier-budget"][value="2to5k"]')).toBeChecked()
  await dialog.getByRole('button', { name: 'Continuă' }).click()
  await expect(dialog.locator('#qual-name')).toHaveValue('Ana Pop')
})

test('a successful send clears the flow for the next opening', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()
  await expect(dialog.getByText('Mulțumim — am primit detaliile.')).toBeVisible()

  await dialog.getByRole('button', { name: 'Închide' }).last().click()
  await page.locator('#top').getByRole('button', { name: 'Vezi dacă te putem ajuta' }).click()
  await expect(dialog.getByText('Pasul 1 din 3')).toBeVisible()
  await expect(dialog.locator('input[name="qualifier-stage"]:checked')).toHaveCount(0)
})

test('"Continuă" stays on screen on a phone once a stage is chosen, without covering the last card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { dialog } = await openFromHero(page)
  await dialog.getByText('Am fișiere Figma sau resurse de design gata.').click()

  const next = dialog.getByRole('button', { name: 'Continuă' })
  await expect(next).toBeInViewport({ ratio: 1 })
  // Nothing sits on top of it: the click lands on the button itself.
  const box = await next.boundingBox()
  if (!box) throw new Error('"Continuă" has no box')
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.textContent?.trim(),
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  )
  expect(hit).toBe('Continuă')

  // Scrolled to the end, the row sits below the last card instead of over it.
  await dialog.evaluate((panel) => panel.parentElement?.scrollTo({ top: panel.parentElement.scrollHeight }))
  const lastCard = dialog.locator('label').filter({ has: page.locator('input[value="D"]') })
  const cardBox = await lastCard.boundingBox()
  const nextBox = await next.boundingBox()
  expect((cardBox?.y ?? 0) + (cardBox?.height ?? 0)).toBeLessThanOrEqual(nextBox?.y ?? 0)
})

test('the confirmation lists what happens next and when', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })
  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  const status = dialog.getByRole('status')
  await expect(status.getByRole('heading', { name: 'Mulțumim — am primit detaliile.' })).toBeFocused()
  await expect(status.getByRole('listitem')).toHaveText([
    /Răspuns scris în 1 zi lucrătoare/,
    /Discovery de 60 de minute/,
    /Specificație de scop și preț în 48 de ore/,
  ])
})

test('a failed send shows the contact email as a mailto link and keeps the fields', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    await route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ statusCode: 502 }) })
  })
  const dialog = await reachContactStep(page)
  await dialog.locator('#qual-name').fill('Ana Pop')
  await dialog.locator('#qual-email').fill('ana@example.com')
  await dialog.getByRole('button', { name: 'Trimite solicitarea' }).click()

  const alert = dialog.getByRole('alert')
  await expect(alert).toContainText('Ceva n-a mers.')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:[^@\s]+@[^@\s]+$/)
  await expect(dialog.locator('#qual-name')).toHaveValue('Ana Pop')
  await expect(dialog.locator('#qual-email')).toHaveValue('ana@example.com')
})

test('the contact field asks for an email, as the server only accepts one', async ({ page }) => {
  const dialog = await reachContactStep(page)
  await expect(dialog.getByLabel('Email de lucru', { exact: true })).toHaveAttribute('type', 'email')
})

test('a stage card picked with the arrow keys on a phone is not hidden behind the "Continuă" row', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { dialog } = await openFromHero(page)
  await dialog.locator('input[name="qualifier-stage"]').first().focus()
  await page.keyboard.press('Space')
  const row = dialog.getByRole('button', { name: 'Continuă' }).locator('..')
  for (let presses = 0; presses < 4; presses++) {
    await page.keyboard.press('ArrowDown')
    const card = dialog.locator('label').filter({ has: page.locator('input:checked') })
    await expect.poll(async () => {
      const [cardBox, rowBox] = await Promise.all([card.boundingBox(), row.boundingBox()])
      return (cardBox?.y ?? 0) + (cardBox?.height ?? 0) <= (rowBox?.y ?? 0) + 1
    }).toBe(true)
  }
})
