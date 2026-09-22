import { describe, expect, it } from 'vitest'
import { escapeXml } from './escapeXml'

describe('escapeXml', () => {
  it('escapes all five XML special characters', () => {
    expect(escapeXml(`<title> "quotes" & 'apostrophes' </title>`)).toBe(
      '&lt;title&gt; &quot;quotes&quot; &amp; &apos;apostrophes&apos; &lt;/title&gt;',
    )
  })

  it('leaves ordinary text unchanged', () => {
    expect(escapeXml('Logistics SaaS, Romania')).toBe('Logistics SaaS, Romania')
  })

  it('escapes & before the characters it would otherwise double-escape', () => {
    expect(escapeXml('Tom & Jerry <3')).toBe('Tom &amp; Jerry &lt;3')
  })
})
