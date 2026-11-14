import { expect, test, type BrowserContext, type Page } from '@playwright/test'

// The editors must open on the production build: there, a route guard registered after an await
// throws, which dev mode only warns about. The session is fabricated; the browser's calls to
// Supabase are answered here, and the server's own calls fail with it, which the admin already
// tolerates (the list shows its load error, the sidebar hides the leads badge). Only new items
// are opened, because an existing one would need the server to read it from the database.
const supabaseUrl = (process.env.NUXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')

test.skip(!supabaseUrl, 'NUXT_PUBLIC_SUPABASE_URL is not set')

const user = {
  id: '00000000-0000-4000-8000-0000000000e2',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@example.invalid',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}

function fakeSession() {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const claims = { sub: user.id, aud: 'authenticated', role: 'authenticated', email: user.email, aal: 'aal2', iat: now, exp: now + 3600 }
  return {
    access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.e2e`,
    refresh_token: 'e2e',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    user,
  }
}

async function signIn(context: BrowserContext) {
  // Same name and encoding as @nuxtjs/supabase / @supabase/ssr: sb-<first host label>-auth-token, base64url JSON.
  const name = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const value = `base64-${Buffer.from(JSON.stringify(fakeSession())).toString('base64url')}`
  await context.addCookies([{ name, value, domain: 'localhost', path: '/' }])

  const cors = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }
  await context.route(`${supabaseUrl}/auth/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(user) }),
  )
  await context.route(`${supabaseUrl}/rest/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: { ...cors, 'content-range': '*/0' }, body: '[]' }),
  )
}

function collectPageErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test.beforeEach(async ({ context }) => {
  await signIn(context)
})

test('the project editor opens from the list and from its address', async ({ page }) => {
  const errors = collectPageErrors(page)

  await page.goto('/admin/projects')
  // Hydrated first, so the click is an in-app navigation: the path that left the editor blank.
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'Proiect nou' }).click()
  await expect(page).toHaveURL(/\/admin\/projects\/nou$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Proiect nou' })).toBeVisible()
  await expect(page.getByLabel('Slug RO')).toBeVisible()

  await page.goto('/admin/projects/nou')
  await expect(page).toHaveURL(/\/admin\/projects\/nou$/)
  await expect(page.getByLabel('Slug RO')).toBeVisible()

  expect(errors).toEqual([])
})

test('the news editor opens from the list and from its address', async ({ page }) => {
  const errors = collectPageErrors(page)

  await page.goto('/admin/news')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'Adaugă' }).click()
  await expect(page).toHaveURL(/\/admin\/news\/nou$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Noutate nouă' })).toBeVisible()
  await expect(page.getByLabel('Numele sursei *')).toBeVisible()

  await page.goto('/admin/news/nou')
  await expect(page).toHaveURL(/\/admin\/news\/nou$/)
  await expect(page.getByLabel('Numele sursei *')).toBeVisible()

  expect(errors).toEqual([])
})

test('an editor with unsaved changes asks before leaving', async ({ page }) => {
  await page.goto('/admin/news')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'Adaugă' }).click()
  await page.getByLabel('Numele sursei *').fill('Sursă e2e')

  let question = ''
  page.once('dialog', (dialog) => {
    question = dialog.message()
    return dialog.dismiss()
  })
  await page.getByRole('link', { name: 'Proiecte', exact: true }).click()

  await expect.poll(() => question).toContain('modificări nesalvate')
  await expect(page).toHaveURL(/\/admin\/news\/nou$/)
})

// The topbar of an admin screen: the bar that holds the page's h1.
const topbar = (page: Page) => page.locator('div:has(> div > h1)')

// Instant, not the site's smooth scrolling, so the assertions run against the bottom of the form.
async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(3000)
}

test('the project editor keeps Save in view at the bottom of the form', async ({ page }) => {
  await page.goto('/admin/projects/nou')
  // After hydration: the router scrolls to the top once the page has loaded.
  await page.waitForLoadState('networkidle')
  await scrollToBottom(page)
  await expect(page.getByRole('button', { name: 'Salvează' })).toBeInViewport({ ratio: 1 })
})

test('a failed save brings its reasons into view and marks the fields', async ({ page }) => {
  await page.goto('/admin/projects/nou')
  await page.waitForLoadState('networkidle')
  await scrollToBottom(page)
  await page.keyboard.press('Control+s')

  const alert = page.getByRole('alert').filter({ hasText: 'Nu s-a salvat' })
  await expect(alert).toBeFocused()
  await expect(alert).toBeInViewport()
  await expect(alert).toContainText('Situație (RO) este obligatorie.')
  await expect(alert).toContainText('Slug RO este obligatoriu.')
  await expect(alert).toContainText('Slug EN este obligatoriu.')

  const slugRo = page.getByLabel('Slug RO')
  await expect(slugRo).toHaveAttribute('aria-invalid', 'true')
  // The mark goes as soon as the field is fixed.
  await slugRo.fill('e2e-proiect')
  await expect(slugRo).not.toHaveAttribute('aria-invalid')
})

test('the project editor says when edits are unsaved, and when they are saved', async ({ page }) => {
  const project = { id: '00000000-0000-4000-8000-0000000000p1', slug_ro: 'e2e-proiect', slug_en: 'e2e-project' }
  let saveStatus = 500
  await page.route(`${supabaseUrl}/rest/v1/rpc/save_project`, (route) =>
    route.fulfill(
      saveStatus === 200
        ? { status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(project) }
        : { status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ message: 'Eroare e2e' }) },
    ),
  )
  // The saved project reopens under its slug; its row is read in the browser.
  await page.route(`${supabaseUrl}/rest/v1/projects?*slug_ro=eq.e2e-proiect*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify([
        {
          ...project,
          published_at: null,
          title_ro: 'Titlu e2e',
          card_title_ro: 'Card e2e',
          summary_ro: 'Descriere e2e',
          lead_ro: 'Lead e2e',
          context_body_ro: 'Situație e2e',
          project_facts: [],
          project_stack: [],
          project_stats: [],
          project_images: [],
        },
      ]),
    }),
  )
  await page.route('**/api/admin/revalidate', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ peers: { failed: 0 } }) }),
  )

  await page.goto('/admin/projects/nou')
  await page.waitForLoadState('networkidle')
  await expect(topbar(page)).not.toContainText('Modificări nesalvate')

  await page.getByLabel('Slug RO').fill(project.slug_ro)
  await page.getByLabel('Slug EN').fill(project.slug_en)
  await page.getByRole('textbox', { name: /^Titlu \(H1 studiu de caz\).* RO$/ }).fill('Titlu e2e')
  await page.getByRole('textbox', { name: /^Titlu card \(homepage\).* RO$/ }).fill('Card e2e')
  await page.getByRole('textbox', { name: /^Descriere card.* RO$/ }).fill('Descriere e2e')
  await page.getByRole('textbox', { name: /^Lead \(sub H1\).* RO$/ }).fill('Lead e2e')
  await page.getByRole('textbox', { name: /^Text \(paragrafe.* RO$/ }).first().fill('Situație e2e')
  await expect(topbar(page)).toContainText('Modificări nesalvate')

  // A server error is spelled out under the topbar, not only in the status label.
  await page.getByRole('button', { name: 'Salvează' }).click()
  const alert = page.getByRole('alert').filter({ hasText: 'Nu s-a salvat' })
  await expect(alert).toContainText('Eroare e2e')
  await expect(alert).toBeFocused()
  await expect(topbar(page)).toContainText('Modificări nesalvate')

  saveStatus = 200
  await page.getByRole('button', { name: 'Salvează' }).click()
  await expect(page).toHaveURL(/\/admin\/projects\/e2e-proiect$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Card e2e' })).toBeVisible()
  await expect(topbar(page)).toContainText('Salvat')
  await expect(topbar(page)).not.toContainText('Modificări nesalvate')
})

test('the news topbar shows the stored state, not the unsaved checkbox', async ({ page }) => {
  await page.goto('/admin/news/nou')
  await page.waitForLoadState('networkidle')
  await expect(topbar(page)).toContainText('Draft')

  await page.getByRole('checkbox', { name: 'Draft' }).check()
  await expect(page.getByRole('checkbox', { name: 'Publicat' })).toBeChecked()
  await expect(topbar(page)).toContainText('Draft')
  await expect(topbar(page)).not.toContainText('Publicat')
  await expect(topbar(page)).toContainText('Modificări nesalvate')
})

test('a failed news save lists its issues under the topbar', async ({ page }) => {
  await page.goto('/admin/news/nou')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Salvează' }).click()

  const alert = page.getByRole('alert').filter({ hasText: 'Nu s-a salvat' })
  await expect(alert).toBeFocused()
  await expect(alert.getByRole('listitem')).toContainText(['Titlul (RO) este obligatoriu.', 'Link-ul sursei este obligatoriu.'])
  await expect(page.getByLabel('Link către original')).toHaveAttribute('aria-invalid', 'true')
})

test('each admin tab is titled after its screen', async ({ page, context }) => {
  await page.goto('/admin/projects')
  await expect(page).toHaveTitle('Proiecte · CODEPEDIA')
  await page.goto('/admin/projects/nou')
  await expect(page).toHaveTitle('Proiect nou · CODEPEDIA')
  await page.goto('/admin/news/nou')
  await expect(page).toHaveTitle('Noutate nouă · CODEPEDIA')

  await context.clearCookies()
  await page.goto('/admin/login')
  await expect(page).toHaveTitle('Autentificare · CODEPEDIA')
})
