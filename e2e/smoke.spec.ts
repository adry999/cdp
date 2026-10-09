import { expect, test } from '@playwright/test'
import { firstPublishedProject } from './support/helpers'

test('RO homepage renders', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro-RO')
  await expect(page).toHaveTitle(/CODEPEDIA/)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN homepage renders', async ({ page }) => {
  const response = await page.goto('/en')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page).toHaveTitle(/CODEPEDIA/)
  await expect(page.locator('h1')).toBeVisible()
})

test('RO case study page renders', async ({ page, request }) => {
  const project = await firstPublishedProject(request)
  const response = await page.goto(`/proiecte/${project.slug_ro}`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN case study page renders', async ({ page, request }) => {
  const project = await firstPublishedProject(request)
  const response = await page.goto(`/en/work/${project.slug_en ?? project.slug_ro}`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('case-study locale switch lands on the correct slug for the target locale', async ({ page, request }) => {
  const project = await firstPublishedProject(request)
  await page.goto(`/proiecte/${project.slug_ro}`)
  await page.locator('header').getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/en/work/${project.slug_en ?? project.slug_ro}$`))
})

test('admin login page renders and hydrates', async ({ page }) => {
  const response = await page.goto('/admin/login')
  expect(response?.status()).toBe(200)
  await expect(page.locator('input#email')).toBeVisible()
  await expect(page.locator('input#password')).toBeVisible()
})

for (const [path, lang] of [
  ['/preturi', 'ro-RO'],
  ['/en/pricing', 'en-US'],
  ['/despre', 'ro-RO'],
  ['/en/about', 'en-US'],
  ['/contact', 'ro-RO'],
  ['/en/contact', 'en-US'],
] as const) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toBeVisible()
  })
}
