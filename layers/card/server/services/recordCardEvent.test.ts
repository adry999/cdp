import { describe, expect, it, vi } from 'vitest'
import { recordCardEvent, type RecordCardEventDependencies } from './recordCardEvent'

function buildDeps(overrides: Partial<RecordCardEventDependencies> = {}): RecordCardEventDependencies {
  return { knownSlugs: ['adrian'], allow: vi.fn(() => true), insert: vi.fn(async () => undefined), ...overrides }
}

describe('recordCardEvent', () => {
  it('stores a valid event', async () => {
    const deps = buildDeps()
    expect(await recordCardEvent({ slug: 'adrian', kind: 'save' }, deps)).toEqual({ outcome: 'accepted' })
    expect(deps.insert).toHaveBeenCalledWith({ slug: 'adrian', kind: 'save', source: null })
  })

  it('rejects an invalid event before counting it against the limit', async () => {
    const deps = buildDeps()
    expect(await recordCardEvent({ slug: 'adrian', kind: 'nope' }, deps)).toEqual({ outcome: 'invalid' })
    expect(deps.allow).not.toHaveBeenCalled()
    expect(deps.insert).not.toHaveBeenCalled()
  })

  it('stops a caller over the limit without storing', async () => {
    const deps = buildDeps({ allow: vi.fn(() => false) })
    expect(await recordCardEvent({ slug: 'adrian', kind: 'view' }, deps)).toEqual({ outcome: 'rate_limited' })
    expect(deps.insert).not.toHaveBeenCalled()
  })
})
