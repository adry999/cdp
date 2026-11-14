import { expect, test } from '@playwright/test'

// The fixed-price offer: one callout on the pricing page and one under the service stages on the homepage.
test('the pricing page shows the fixed-price offer with its terms', async ({ page }) => {
  await page.goto('/preturi')
  const offer = page.locator('#oferta')
  await expect(offer.getByRole('heading', { level: 2 })).toContainText('1.500€')
  await expect(offer.getByText('4–6 săptămâni până la lansare')).toBeVisible()
  await expect(offer.getByText('2 module la alegere')).toBeVisible()
  await expect(offer.getByRole('link', { name: 'Cere o discuție' })).toHaveAttribute('href', '/contact')
})

test('the homepage links the offer to its section on the pricing page', async ({ page }) => {
  // Without a country header the homepage redirects to English.
  await page.setExtraHTTPHeaders({ 'cf-ipcountry': 'RO' })
  await page.goto('/')
  const services = page.locator('#servicii')
  await expect(services.getByRole('heading', { level: 3, name: /1\.500€/ })).toBeVisible()
  await expect(services.getByRole('link', { name: 'Ce include →' })).toHaveAttribute('href', '/preturi#oferta')
})

test('the English pricing page shows the offer in English', async ({ page }) => {
  await page.goto('/en/pricing')
  const offer = page.locator('#oferta')
  await expect(offer.getByRole('heading', { level: 2 })).toContainText('€1,500')
  await expect(offer.getByRole('link', { name: 'Request a call' })).toHaveAttribute('href', '/en/contact')
})
