import { expect, test } from '@playwright/test'

test('RO homepage renders', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro-RO')
  await expect(page).toHaveTitle(/Codepedia/)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN homepage renders', async ({ page }) => {
  const response = await page.goto('/en')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page).toHaveTitle(/Codepedia/)
  await expect(page.locator('h1')).toBeVisible()
})

test('RO case study page renders', async ({ page }) => {
  const response = await page.goto('/proiecte/saas-logistica')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN case study page renders', async ({ page }) => {
  const response = await page.goto('/en/work/saas-logistica')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('admin login page renders and hydrates', async ({ page }) => {
  const response = await page.goto('/admin/login')
  expect(response?.status()).toBe(200)
  await expect(page.locator('input#email')).toBeVisible()
  await expect(page.locator('input#password')).toBeVisible()
})
