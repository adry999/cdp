import { expect, test } from '@playwright/test'

test('RO blog index renders', async ({ page }) => {
  const response = await page.goto('/blog')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN blog index renders', async ({ page }) => {
  const response = await page.goto('/en/blog')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('clicking the Blog nav link navigates client-side with no page error', async ({ page }) => {
  // The nav link triggers client-side (SPA) navigation, not a full page
  // load — this is the exact path that broke when @nuxt/content's client
  // queryCollection() tried to run SQLite-via-WASM under this site's CSP.
  // Every other test in this file uses page.goto(), which is SSR and
  // wouldn't have caught that regression.
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/en')
  await page.locator('header').getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/blog$/)
  await expect(page.locator('h1')).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('a missing post 404s', async ({ page }) => {
  const response = await page.goto('/blog/this-slug-does-not-exist')
  expect(response?.status()).toBe(404)
})

test('the RO RSS feed responds with XML', async ({ request }) => {
  const response = await request.get('/blog/rss.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
})

test('the EN RSS feed responds with XML', async ({ request }) => {
  const response = await request.get('/en/blog/rss.xml')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('xml')
})
