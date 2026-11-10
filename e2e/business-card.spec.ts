import { expect, test } from '@playwright/test'

// /c is printed as a QR code on business cards: it must never move or break.
test('the default business-card page renders the person and the contact actions', async ({ page }) => {
  const response = await page.goto('/c?s=carte')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro-RO')
  await expect(page.locator('h1')).toHaveText('Adrian Iovu')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await expect(page.getByRole('link', { name: 'Salvează contactul' })).toHaveAttribute('href', '/vcard/adrian.vcf')
  await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+$/)
  await expect(page.getByRole('link', { name: 'Telegram' })).toHaveAttribute('href', /^https:\/\/t\.me\//)
})

test('the EN business-card page renders', async ({ page }) => {
  const response = await page.goto('/en/c')
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.getByRole('link', { name: 'Save contact' })).toHaveAttribute('href', '/vcard/adrian.vcf?lang=en')
})

test('an unknown person is a 404', async ({ page }) => {
  const response = await page.goto('/c/nobody')
  expect(response?.status()).toBe(404)
})

test('the vCard downloads with the person\'s details', async ({ request }) => {
  const response = await request.get('/vcard/adrian.vcf')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/vcard')
  expect(response.headers()['content-disposition']).toBe('attachment; filename="adrian-iovu.vcf"')
  const body = await response.text()
  expect(body).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/)
  expect(body).toContain('FN:Adrian Iovu\r\n')
  expect(body).toMatch(/TEL;TYPE=WORK,VOICE:\+\d+\r\n/)
})

test('the business-card page stays out of the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toMatch(/\/c[<?/]/)
})
