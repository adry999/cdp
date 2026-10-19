import { test, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test'

// Reads the current published projects instead of hardcoding a slug, so suites
// don't break when a real case study is renamed or unpublished.
export async function firstPublishedProject(request: APIRequestContext) {
  const res = await request.get('/api/projects')
  const projects = (await res.json()) as { slug_ro: string; slug_en: string | null }[]
  test.skip(!projects.length, 'No published projects to test against')
  const [project] = projects
  if (!project) throw new Error('No published projects to test against')
  return project
}

// Same idea for news: a published item is the only fixture the detail pages need.
export async function firstPublishedNews(request: APIRequestContext) {
  const res = await request.get('/api/news')
  const items = (await res.json()) as { slug_ro: string; slug_en: string | null }[]
  test.skip(!items.length, 'No published news to test against')
  const [item] = items
  if (!item) throw new Error('No published news to test against')
  return item
}

// The locale redirect only fires on `/` and `/en`; the override cookie keeps it
// from interfering with fixed-locale flows.
export async function pinLocale(context: BrowserContext, locale: 'ro' | 'en' = 'ro') {
  await context.addCookies([{ name: 'codepedia_locale', value: locale, domain: 'localhost', path: '/' }])
}

// The banner covers the bottom of the page and would intercept clicks there.
export async function dismissConsentBanner(page: Page) {
  await page.getByRole('button', { name: 'Doar necesare' }).click()
}
