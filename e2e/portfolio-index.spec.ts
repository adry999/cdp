import { expect, test } from '@playwright/test'

test('RO portfolio index renders', async ({ page }) => {
  const response = await page.goto('/proiecte')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('EN portfolio index renders', async ({ page }) => {
  const response = await page.goto('/en/work')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()
})

test('clicking a filter chip narrows the grid and updates the query', async ({ page }) => {
  await page.goto('/proiecte')

  const chipRow = page.locator('button[aria-pressed]')
  const chipCount = await chipRow.count()
  test.skip(chipCount < 2, 'Fewer than two service tags published — chip row does not render')

  const cardLinks = page.locator('a[href*="/proiecte/"], a[href*="/work/"]')
  const totalCards = await cardLinks.count()

  // The first non-"all" chip.
  const tagChip = chipRow.nth(1)
  await tagChip.click()

  await expect(page).toHaveURL(/\?tag=/)
  const filteredCount = await cardLinks.count()
  expect(filteredCount).toBeLessThanOrEqual(totalCards)
  expect(filteredCount).toBeGreaterThan(0)
})
