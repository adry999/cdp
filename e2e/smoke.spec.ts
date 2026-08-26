import { expect, test, type APIRequestContext } from '@playwright/test'

// Reads the current published projects instead of hardcoding a slug, so this
// suite doesn't break the day a real case study is renamed, unpublished, or
// replaced — it only asserts that *whatever* is currently published renders.
async function firstPublishedProject(request: APIRequestContext) {
  const res = await request.get('/api/projects')
  const projects = (await res.json()) as { slug_ro: string; slug_en: string | null }[]
  test.skip(!projects.length, 'No published projects to test against')
  return projects[0]
}

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
