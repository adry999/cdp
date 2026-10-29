import { expect, test } from '@playwright/test'
import { firstPublishedNews, firstPublishedProject } from './support/helpers'

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
  ['/noutati', 'ro-RO'],
  ['/en/news', 'en-US'],
  ['/servicii', 'ro-RO'],
  ['/en/services', 'en-US'],
  ['/en/services/web-app', 'en-US'],
  ['/blog/categorie/preturi', 'ro-RO'],
  ['/en/blog/category/pricing', 'en-US'],
] as const) {
  test(`${path} renders`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toBeVisible()
  })
}

test('/llms.txt and /llms-full.txt return text/plain with 200', async ({ request }) => {
  const res1 = await request.get('/llms.txt')
  expect(res1.status()).toBe(200)
  expect(res1.headers()['content-type']).toContain('text/plain')
  const text1 = await res1.text()
  expect(text1).toContain('# CODEPEDIA')

  const res2 = await request.get('/llms-full.txt')
  expect(res2.status()).toBe(200)
  expect(res2.headers()['content-type']).toContain('text/plain')
  const text2 = await res2.text()
  expect(text2).toContain('# CODEPEDIA')
})

test('RO news detail page renders', async ({ page, request }) => {
  const item = await firstPublishedNews(request)
  const response = await page.goto(`/noutati/${item.slug_ro}`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN news detail page renders', async ({ page, request }) => {
  const item = await firstPublishedNews(request)
  const response = await page.goto(`/en/news/${item.slug_en?.trim() ? item.slug_en : item.slug_ro}`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('/sitemap.xml returns XML with 200', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('xml')
  expect(await res.text()).toMatch(/^<\?xml/)
})

test('/robots.txt returns text/plain with 200', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/plain')
  expect(await res.text()).toContain('User-agent')
})

test('llms-full.txt lists the full guides and articles', async ({ request }) => {
  const response = await request.get('/llms-full.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/plain')
  const body = await response.text()
  const guides = body.split(/^## (?:Full Guides and Articles|Ghiduri și Articole Complete)$/m)[1]
  expect(guides, 'guides section heading').toBeDefined()
  expect(guides).toMatch(/^### /m)
})
