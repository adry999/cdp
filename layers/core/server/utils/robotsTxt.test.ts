import { describe, expect, it } from 'vitest'
import { robotsTxt } from './robotsTxt'

describe('robotsTxt', () => {
  it('advertises the sitemap on the live site', () => {
    expect(robotsTxt('https://codepedia.studio', false)).toBe(
      'User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://codepedia.studio/sitemap.xml\n',
    )
  })

  it('drops the sitemap on a preview, without blocking the crawl', () => {
    const body = robotsTxt('https://preview.test', true)
    expect(body).not.toContain('Sitemap')
    expect(body).not.toMatch(/^Disallow: \/$/m)
  })
})
