import { describe, expect, it } from 'vitest'
import { renderEmailHtml, type EmailContent } from './emailHtml'

function content(overrides: Partial<EmailContent> = {}): EmailContent {
  return {
    lang: 'ro',
    preheader: 'Previzualizare',
    heading: 'Titlu',
    logoUrl: 'https://codepedia.md/brand/codepedia-wordmark-email.png',
    footer: 'Codepedia SRL',
    ...overrides,
  }
}

describe('renderEmailHtml', () => {
  it('escapes visitor text everywhere it appears', () => {
    const html = renderEmailHtml(
      content({
        heading: 'Mulțumim, <script>alert(1)</script>',
        fields: [{ label: 'Nume', value: '"><img src=x onerror=alert(1)>' }],
        quote: { label: 'Mesaj', text: '<b>bold</b>' },
      }),
    )
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<b>bold</b>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('keeps line breaks of the quoted message', () => {
    expect(renderEmailHtml(content({ quote: { label: 'Mesaj', text: 'unu\ndoi' } }))).toContain('unu<br>doi')
  })

  it('renders the optional blocks only when given', () => {
    const bare = renderEmailHtml(content())
    expect(bare).not.toContain('border-left:2px')
    expect(bare).not.toContain('<a href')

    const full = renderEmailHtml(
      content({
        paragraphs: ['Primul paragraf.'],
        fields: [{ label: 'Email', value: 'ana@example.com' }],
        action: { label: 'Deschide', url: 'https://codepedia.md/admin/leads' },
      }),
    )
    expect(full).toContain('Primul paragraf.')
    expect(full).toContain('ana@example.com')
    expect(full).toContain('href="https://codepedia.md/admin/leads"')
  })

  it('sets the document language and the logo', () => {
    const html = renderEmailHtml(content({ lang: 'en' }))
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('src="https://codepedia.md/brand/codepedia-wordmark-email.png"')
  })
})
