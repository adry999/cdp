import { expect, test, type Page } from '@playwright/test'

interface ProjectSlugs {
  slug_ro: string
  slug_en: string | null
}

async function seoHead(page: Page) {
  return page.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')]
    return {
      canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
      alternates: Object.fromEntries(links.map((link) => [link.hreflang, link.href])),
      robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? null,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent ?? ''),
    }
  })
}

async function expectSeo(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response?.status(), path).toBe(200)
  const head = await seoHead(page)

  expect(head.canonical, `${path} canonical`).toBeTruthy()
  expect(head.alternates['ro'], `${path} hreflang ro`).toBeTruthy()
  expect(head.alternates['x-default'], `${path} x-default`).toBeTruthy()
  for (const [index, raw] of head.jsonLd.entries()) {
    expect(() => JSON.parse(raw), `${path} JSON-LD #${index}`).not.toThrow()
  }
  return head
}

test('home pages carry canonical, hreflang and valid JSON-LD', async ({ page }) => {
  for (const path of ['/', '/en']) {
    const head = await expectSeo(page, path)
    expect(head.alternates['en'], `${path} hreflang en`).toBeTruthy()
    // x-default is the English page.
    expect(head.alternates['x-default'], path).toBe(head.alternates['en'])
  }
})

test('a blog post carries canonical, hreflang and valid JSON-LD', async ({ page }) => {
  await page.goto('/blog')
  const href = await page
    .locator('main a[href^="/blog/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? '').find((value) => /^\/blog\/[^/]+$/.test(value) && !value.endsWith('rss.xml')),
    )
  expect(href, 'a blog post link on /blog').toBeTruthy()
  const head = await expectSeo(page, href as string)
  expect(head.alternates['en'] ?? null).not.toBeNull()
})

test('a case study carries canonical, hreflang and valid JSON-LD; a pending EN copy drops its alternate', async ({ page, request }) => {
  const list = await request.get('/api/projects')
  expect(list.ok()).toBe(true)
  const [project] = (await list.json()) as ProjectSlugs[]
  expect(project, 'a published project').toBeTruthy()

  const ro = await expectSeo(page, `/proiecte/${project!.slug_ro}`)
  if (ro.alternates['en']) {
    expect(ro.alternates['x-default']).toBe(ro.alternates['en'])
  } else {
    // The EN copy is still Romanian: no EN alternate, x-default falls back to the RO page.
    expect(ro.alternates['x-default']).toBe(ro.alternates['ro'])
  }

  const en = await expectSeo(page, `/en/work/${project!.slug_en ?? project!.slug_ro}`)
  if (!en.alternates['en']) expect(en.robots).toContain('noindex')
})
