import { describe, expect, it } from 'vitest'
import { parseLlmsPost } from './llmsPost'

describe('parseLlmsPost', () => {
  it('strips the front matter and takes the title from it', () => {
    const raw = "---\ntitle: 'Cât costă un site'\nslug: cat-costa-un-site\n---\n\nCorpul articolului.\n"
    expect(parseLlmsPost('cat-costa-un-site.md', raw)).toEqual({
      slug: 'cat-costa-un-site',
      title: 'Cât costă un site',
      content: 'Corpul articolului.',
    })
  })

  it('falls back to the slug when there is no title', () => {
    expect(parseLlmsPost('no-title.md', '---\nauthor: x\n---\r\nBody')?.title).toBe('no-title')
  })

  it('skips drafts', () => {
    expect(parseLlmsPost('wip.md', "---\ntitle: 'WIP'\ndraft: true\n---\nBody")).toBeNull()
    expect(parseLlmsPost('live.md', "---\ntitle: 'Live'\ndraft: false\n---\nBody")).not.toBeNull()
  })

  it('builds the slug from the front matter, falling back to the file name', () => {
    expect(parseLlmsPost('old-name.md', "---\ntitle: 'T'\nslug: new-name\n---\nBody")?.slug).toBe('new-name')
    expect(parseLlmsPost('old-name.md', "---\ntitle: 'T'\n---\nBody")?.slug).toBe('old-name')
  })
})
