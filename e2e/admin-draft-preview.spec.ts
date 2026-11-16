import { expect, test } from '@playwright/test'
import { signInAsFakeAdmin, supabaseUrl } from './support/adminSession'

// The draft preview: an admin sees a saved project, draft or not, as its case study under
// /admin/preview/projects/<slug>; nobody else does. The page reads the row in the browser, like the
// editor, so the signed-in tests answer Supabase there; who may read drafts is the database's RLS.

const slug = 'e2e-draft'
const title = 'Titlu draft e2e, văzut doar în previzualizare'

// A complete saved row as the editor's read (ADMIN_PROJECT_SELECT) returns it.
const row = {
  id: '00000000-0000-4000-8000-0000000000d1',
  published_at: null,
  nav_services: [],
  slug_ro: slug,
  slug_en: 'e2e-draft-en',
  title_ro: title,
  title_en: null,
  card_title_ro: 'Card draft e2e',
  card_title_en: null,
  summary_ro: 'Descriere draft e2e',
  summary_en: null,
  lead_ro: 'Lead draft e2e',
  lead_en: null,
  year: 2026,
  tech: ['Nuxt'],
  service_tag: null,
  featured: false,
  cover_path: null,
  cover_alt_ro: null,
  cover_alt_en: null,
  hero_path: null,
  hero_alt_ro: null,
  hero_alt_en: null,
  kind_ro: null,
  kind_en: null,
  tags_ro: [],
  tags_en: [],
  links: [],
  screens_demo: false,
  win_value_ro: null,
  win_value_en: null,
  win_label_ro: null,
  win_label_en: null,
  context_body_ro: 'Situația din draftul e2e.',
  context_body_en: null,
  solution_body_ro: null,
  solution_body_en: null,
  obstacles_body_ro: null,
  obstacles_body_en: null,
  changes_body_ro: null,
  changes_body_en: null,
  result_body_ro: null,
  result_body_en: null,
  quote_ro: null,
  quote_en: null,
  quote_author: null,
  quote_role_ro: null,
  quote_role_en: null,
  quote_company: null,
  star_cost_ro: null,
  star_cost_en: null,
  star_goal_ro: null,
  star_goal_en: null,
  star_constraints_ro: null,
  star_constraints_en: null,
  star_biz_ro: null,
  star_biz_en: null,
  star_incident_ro: null,
  star_incident_en: null,
  star_gains_ro: null,
  star_gains_en: null,
  star_savings_ro: null,
  star_savings_en: null,
  adapt_ro: null,
  adapt_en: null,
  delivered_ro: null,
  delivered_en: null,
  faq_ro: null,
  faq_en: null,
  gallery_heading_ro: null,
  gallery_heading_en: null,
  sort_order: 0,
  project_facts: [],
  project_stack: [],
  project_stats: [],
  project_images: [],
}

test.describe('signed out', () => {
  test('the preview page sends to the login, uncached and unindexed', async ({ request }) => {
    const page = await request.get(`/admin/preview/projects/${slug}`, { maxRedirects: 0 })
    expect(page.status()).toBe(302)
    expect(page.headers().location).toBe('/admin/login')
    expect(page.headers()['cache-control']).toBe('private, no-store')
    expect(page.headers()['x-robots-tag']).toBe('noindex, nofollow')
  })

  // Needs a project that is a draft in the database the server reads; CI's real data has no fixed one.
  test('a real draft stays out of the public API and behind the login', async ({ request }) => {
    const draftSlug = process.env.E2E_DRAFT_SLUG
    test.skip(!draftSlug, 'E2E_DRAFT_SLUG (the RO slug of a draft project) is not set')

    expect((await request.get(`/api/projects/${draftSlug}`)).status()).toBe(404)
    const page = await request.get(`/admin/preview/projects/${draftSlug}`, { maxRedirects: 0 })
    expect(page.status()).toBe(302)
  })
})

test.describe('signed in', () => {
  test.skip(!supabaseUrl, 'NUXT_PUBLIC_SUPABASE_URL is not set')

  test.beforeEach(async ({ context }) => {
    await signInAsFakeAdmin(context)
  })

  test('shows the saved draft as its case study, under a banner, never indexed', async ({ page }) => {
    await page.route(`${supabaseUrl}/rest/v1/projects?*slug_ro=eq.${slug}*`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify([row]),
      }),
    )

    const response = await page.goto(`/admin/preview/projects/${slug}`)
    expect(response?.headers()['cache-control']).toBe('private, no-store')
    // The draft is loaded in the browser: the server-rendered HTML carries none of it.
    expect(await response?.text()).not.toContain(title)

    const banner = page.getByRole('complementary', { name: 'Previzualizare draft' })
    await expect(banner).toContainText('Previzualizare draft — nepublicat')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    await expect(page).toHaveTitle(/^Draft: Card draft e2e/)
    await expect(banner.getByRole('link', { name: 'Editorul' })).toHaveAttribute('href', `/admin/projects/${slug}`)

    // The banner stays in view while the page scrolls.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await expect(banner).toBeInViewport()
  })

  // The fabricated session answers every other Supabase query with no rows.
  test('says so when the project does not exist', async ({ page }) => {
    await page.goto('/admin/preview/projects/nu-exista')
    await expect(page.getByRole('alert')).toContainText('Proiectul nu există')
  })
})
