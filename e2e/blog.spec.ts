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
