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
