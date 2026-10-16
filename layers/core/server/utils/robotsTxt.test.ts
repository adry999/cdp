import { describe, expect, it } from 'vitest'
import { robotsTxt } from './robotsTxt'

describe('robotsTxt', () => {
  it('advertises the sitemap on the live site and includes explicit AI crawler groups', () => {
    const body = robotsTxt('https://codepedia.studio', false)
    expect(body).toContain('User-agent: *\nDisallow: /admin\nDisallow: /api/')
    expect(body).toContain('User-agent: OAI-SearchBot')
    expect(body).toContain('User-agent: PerplexityBot')
    expect(body).toContain('User-agent: Claude-SearchBot')
    expect(body).toContain('User-agent: GPTBot')
    expect(body).toContain('User-agent: ClaudeBot')
    expect(body).toContain('Sitemap: https://codepedia.studio/sitemap.xml')
  })

  it('drops the sitemap on a preview, without blocking the crawl', () => {
    const body = robotsTxt('https://preview.test', true)
    expect(body).not.toContain('Sitemap')
    expect(body).not.toMatch(/^Disallow: \/$/m)
  })
})
