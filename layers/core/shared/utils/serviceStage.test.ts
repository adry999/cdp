import { describe, expect, it } from 'vitest'
import { stageForServiceParam } from './serviceStage'

describe('stageForServiceParam', () => {
  it('resolves RO and EN route slugs', () => {
    expect(stageForServiceParam('aplicatie-web')).toBe('A')
    expect(stageForServiceParam('web-app')).toBe('A')
    expect(stageForServiceParam('automatizare-ai')).toBe('D')
    expect(stageForServiceParam('ai-automation')).toBe('D')
    expect(stageForServiceParam('grants')).toBe('A')
    expect(stageForServiceParam('website')).toBe('E')
  })

  it('takes the first of repeated params', () => {
    expect(stageForServiceParam(['shopify', 'granturi'])).toBe('E')
  })

  it('ignores unknown or non-string values', () => {
    expect(stageForServiceParam('nope')).toBeUndefined()
    expect(stageForServiceParam('toString')).toBeUndefined()
    expect(stageForServiceParam(undefined)).toBeUndefined()
    expect(stageForServiceParam(null)).toBeUndefined()
    expect(stageForServiceParam('')).toBeUndefined()
  })
})
