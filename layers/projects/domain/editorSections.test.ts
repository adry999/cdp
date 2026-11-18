import { describe, expect, it } from 'vitest'
import { PROJECT_EDITOR_SECTIONS, localeLengthMismatch, projectEditorSectionTitle } from './editorSections'

describe('PROJECT_EDITOR_SECTIONS', () => {
  it('gives every section a unique anchor and an unnumbered title', () => {
    const ids = PROJECT_EDITOR_SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const { id, title } of PROJECT_EDITOR_SECTIONS) {
      expect(id).toMatch(/^[a-z]+$/)
      expect(title).not.toMatch(/secțiun|\d/)
    }
  })

  it('looks a title up by its anchor', () => {
    expect(projectEditorSectionTitle('rezultat')).toBe('Rezultat și feedback')
  })
})

describe('localeLengthMismatch', () => {
  it('names both lengths when they differ', () => {
    expect(localeLengthMismatch([1, 2, 3], [1, 2])).toBe('RO 3 · EN 2')
    expect(localeLengthMismatch([], [{}])).toBe('RO 0 · EN 1')
  })

  it('says nothing when they match', () => {
    expect(localeLengthMismatch([], [])).toBeNull()
    expect(localeLengthMismatch(['a'], ['b'])).toBeNull()
  })
})
