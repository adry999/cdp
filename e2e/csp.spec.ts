import { expect, test } from '@playwright/test'

// Rendered pages carry the policy in a header; prerendered ones (blog) in a <meta> tag.
// Either way script-src lists hashes, never 'unsafe-inline', and the page runs without a violation.
const PAGES = ['/en', '/proiecte', '/en/blog', '/contact', '/despre']

for (const path of PAGES) {
  test(`${path} runs under its CSP without violations`, async ({ page }) => {
    const violations: string[] = []
    page.on('console', (message) => {
      if (/Content Security Policy/i.test(message.text())) violations.push(message.text())
    })
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    const header = response?.headers()['content-security-policy']
    // Prerendered pages are static files: no header, the policy sits in a <meta> tag.
    const meta = await page.evaluate(
      () => document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]')?.content ?? null,
    )
    const policy = header ?? meta
    expect(policy).toMatch(/script-src [^;]*'sha256-/)
    expect(policy).not.toMatch(/script-src [^;]*'unsafe-inline'/)

    await expect(page.locator('h1')).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(violations).toEqual([])
    expect(pageErrors).toEqual([])
  })
}

test('the app hydrates under the CSP: a nav click navigates client-side', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text())
  })
  await page.goto('/en')
  await page.locator('header').getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/blog$/)
  await expect(page.locator('h1')).toBeVisible()
  expect(violations).toEqual([])
})
