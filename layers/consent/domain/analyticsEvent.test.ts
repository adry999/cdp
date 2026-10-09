import { describe, expect, it } from 'vitest'
import { buildGaEvent } from './analyticsEvent'

describe('buildGaEvent', () => {
  it('builds a gtag event call for a known name', () => {
    expect(buildGaEvent('blog_cta_click', { post_slug: 'a', service: 'website' })).toEqual([
      'event',
      'blog_cta_click',
      { post_slug: 'a', service: 'website' },
    ])
  })

  it('drops unknown names', () => {
    expect(buildGaEvent('purchase', {})).toBeNull()
    expect(buildGaEvent(undefined, {})).toBeNull()
  })

  it('keeps only string params and trims long ones', () => {
    const call = buildGaEvent('blog_toc_click', { anchor_id: 'x'.repeat(300), n: 1, bad: null })
    expect(call?.[2]).toEqual({ anchor_id: 'x'.repeat(100) })
  })

  it('tolerates a missing params object', () => {
    expect(buildGaEvent('blog_toc_click', undefined)).toEqual(['event', 'blog_toc_click', {}])
  })
})
