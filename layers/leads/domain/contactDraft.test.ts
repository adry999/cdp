import { describe, expect, it } from 'vitest'
import { emptyContactDraft, hasContactDetails } from './contactDraft'

describe('contactDraft', () => {
  it('starts empty and returns a fresh object each time', () => {
    const first = emptyContactDraft()
    first.name = 'Ana'
    expect(emptyContactDraft()).toEqual({ name: '', email: '', company: '', message: '', budget: '', source: '' })
  })

  it('reports details only when an optional field is filled', () => {
    expect(hasContactDetails({ ...emptyContactDraft(), name: 'Ana', message: 'Salut' })).toBe(false)
    expect(hasContactDetails({ ...emptyContactDraft(), company: 'Acme' })).toBe(true)
    expect(hasContactDetails({ ...emptyContactDraft(), budget: '2to5k' })).toBe(true)
    expect(hasContactDetails({ ...emptyContactDraft(), source: 'LinkedIn' })).toBe(true)
  })
})
