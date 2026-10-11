import { expect, test } from '@playwright/test'

interface ProjectSlugs {
  slug_ro: string
  slug_en: string | null
}

const PLACEHOLDER = /\[\s[^\]]+\s\]|\bTODO\b|\bnull\b|\bundefined\b|\bNaN\b/

// Every published case study, in both locales: no heading without content, no section
// without content, no literal placeholder text.
test('published case studies have no empty sections or placeholders', async ({ page, request }) => {
  const list = await request.get('/api/projects')
  expect(list.ok()).toBe(true)
  const projects = (await list.json()) as ProjectSlugs[]
  expect(projects.length).toBeGreaterThan(0)

  const failures: string[] = []
  for (const project of projects) {
    const targets = [
      { locale: 'ro', path: `/proiecte/${project.slug_ro}` },
      { locale: 'en', path: `/en/work/${project.slug_en ?? project.slug_ro}` },
    ]
    for (const { locale, path } of targets) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(200)
      await expect(page.locator('h1')).toBeVisible()

      const report = await page.evaluate(() => {
        const main = document.querySelector('main') ?? document.body
        const empty: string[] = []
        for (const heading of main.querySelectorAll('h2, h3')) {
          const own = heading.textContent?.trim() ?? ''
          const container = heading.parentElement
          // Content is whatever the heading's parent holds besides the heading, or the
          // heading's next sibling when the parent is only a wrapper.
          const rest = (container?.textContent ?? '').replace(own, '').trim()
          const next = heading.nextElementSibling?.textContent?.trim() ?? ''
          const media = container?.querySelector('img, picture, figure, ul, li') !== null
          if (!own) empty.push('<empty heading>')
          else if (!rest && !next && !media) empty.push(`heading without content: ${own}`)
        }
        for (const section of main.querySelectorAll('section')) {
          const label = section.querySelector('[class*="eyebrow"]')?.textContent?.trim() ?? ''
          const text = (section.textContent ?? '').replace(label, '').trim()
          const hasMedia = section.querySelector('img, picture, figure, ul, li') !== null
          if (!text && !hasMedia) empty.push(`empty section: ${label || section.id || '(unnamed)'}`)
        }
        return { empty, text: (main as HTMLElement).innerText }
      })

      const placeholder = PLACEHOLDER.exec(report.text)
      for (const message of report.empty) failures.push(`${locale} ${project.slug_ro}: ${message}`)
      if (placeholder) failures.push(`${locale} ${project.slug_ro}: placeholder "${placeholder[0]}"`)
    }
  }
  expect(failures).toEqual([])
})
