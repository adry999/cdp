import { describe, expect, it } from 'vitest'
import { emptyQualifierDraft, resumeDraft, type QualifierDraft } from './draft'

function halfDone(): QualifierDraft {
  return {
    step: 3,
    stage: 'A',
    budget: '2to5k',
    contact: { name: 'Ana Pop', email: 'ana@example.com', handle: '', notes: 'Un site nou.' },
  }
}

describe('emptyQualifierDraft', () => {
  it('starts on step 1 with nothing chosen or typed', () => {
    expect(emptyQualifierDraft()).toEqual({
      step: 1,
      stage: '',
      budget: '',
      contact: { name: '', email: '', handle: '', notes: '' },
    })
  })

  it('returns a fresh object each time', () => {
    const first = emptyQualifierDraft()
    first.contact.name = 'Ana'
    expect(emptyQualifierDraft().contact.name).toBe('')
  })
})

describe('resumeDraft', () => {
  it('resumes where the visitor left when no stage is requested', () => {
    expect(resumeDraft(halfDone(), '')).toEqual(halfDone())
  })

  it('resumes where the visitor left when the requested stage is the one already chosen', () => {
    expect(resumeDraft(halfDone(), 'A')).toEqual(halfDone())
  })

  it('goes back to step 1 on a different requested stage and keeps budget and contact fields', () => {
    expect(resumeDraft(halfDone(), 'E')).toEqual({ ...halfDone(), step: 1, stage: 'E' })
  })

  it('preselects the requested stage on a fresh flow', () => {
    expect(resumeDraft(emptyQualifierDraft(), 'D')).toEqual({ ...emptyQualifierDraft(), stage: 'D' })
  })
})
