import { expect, test } from '@playwright/test'

test('redirects / to /en when geo indicates a non-RO/MD country', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/en$/)
})

test('redirects /en to / when geo indicates Romania', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'RO' })
  await page.goto('/en')
  await expect(page).toHaveURL(/\/$/)
})

test('does not redirect a crawler even when geo says en', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  })
  const page = await context.newPage()
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await context.close()
})

test('manual override cookie wins over geo', async ({ page, context }) => {
  await context.addCookies([{ name: 'codepedia_locale', value: 'ro', domain: 'localhost', path: '/' }])
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': 'US' })
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
})
