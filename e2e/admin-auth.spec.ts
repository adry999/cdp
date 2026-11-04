import { expect, test } from '@playwright/test'

test('a public page never downloads supabase-js', async ({ page }) => {
  const scripts: Promise<string>[] = []
  page.on('response', (response) => {
    if (response.url().includes('/_nuxt/') && response.url().endsWith('.js')) scripts.push(response.text())
  })

  await page.goto('/en')
  await page.waitForLoadState('networkidle')

  const bodies = await Promise.all(scripts)
  expect(bodies.length).toBeGreaterThan(0)
  expect(bodies.some((body) => body.includes('GoTrueClient'))).toBe(false)
})

test('an admin page sends a signed-out visitor to the login', async ({ page }) => {
  await page.goto('/admin/projects')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('the login page loads the Supabase client and reports wrong credentials', async ({ page }) => {
  // Answered here, so the test never reaches the real Supabase Auth.
  await page.route('**/auth/v1/token**', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }),
    }),
  )

  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Email').fill('e2e@example.invalid')
  await page.getByLabel('Parolă').fill('not-a-real-password')
  await page.getByRole('button', { name: 'Autentificare' }).click()

  await expect(page.getByText('Email sau parolă greșită.')).toBeVisible()
})

test('the second-factor page sends a signed-out visitor to the login', async ({ page }) => {
  await page.goto('/admin/mfa')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('the login page sends a reset link and answers the same for any address', async ({ page }) => {
  let resetRequested = false
  await page.route('**/auth/v1/recover**', (route) => {
    resetRequested = true
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: '{}',
    })
  })

  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Ai uitat parola?' }).click()
  await page.getByLabel('Email').fill('e2e@example.invalid')
  await page.getByRole('button', { name: 'Trimite linkul de resetare' }).click()

  await expect(page.getByRole('status')).toContainText('Dacă adresa are cont')
  expect(resetRequested).toBe(true)
})

test('the reset page without a recovery session asks for a new link', async ({ page }) => {
  await page.goto('/admin/reset-password')
  await expect(page.getByText('Linkul de resetare nu e valid sau a expirat.')).toBeVisible()
})

test('the admin opens light on a dark system, the public site follows the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/admin/login')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
