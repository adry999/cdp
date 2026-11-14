import { describe, expect, it } from 'vitest'
import { SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'
import { serviceTagForParam, serviceTagForStage, stageForServiceParam, stageForServiceTag } from './serviceStage'

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

describe('serviceTagForParam', () => {
  it('resolves RO and EN route slugs to the service', () => {
    expect(serviceTagForParam('aplicatie-web')).toBe('web-app')
    expect(serviceTagForParam('web-app')).toBe('web-app')
    expect(serviceTagForParam('automatizare-ai')).toBe('ai-automation')
    expect(serviceTagForParam('grants')).toBe('granturi')
    expect(serviceTagForParam(['shopify', 'granturi'])).toBe('shopify')
  })

  it('ignores unknown or non-string values', () => {
    expect(serviceTagForParam('nope')).toBeUndefined()
    expect(serviceTagForParam('toString')).toBeUndefined()
    expect(serviceTagForParam(undefined)).toBeUndefined()
  })
})

describe('stageForServiceTag', () => {
  it('has a stage for every service', () => {
    for (const tag of SERVICE_TAG_IDS) expect(stageForServiceTag(tag)).toMatch(/^[A-E]$/)
    expect(stageForServiceTag('web-app')).toBe('A')
  })
})

describe('serviceTagForStage', () => {
  const withoutGrants = SERVICE_TAG_IDS.filter((tag) => tag !== 'granturi')

  it('names the service when exactly one offered service has the stage', () => {
    expect(serviceTagForStage('D', SERVICE_TAG_IDS)).toBe('ai-automation')
    expect(serviceTagForStage('A', withoutGrants)).toBe('web-app')
  })

  it('names none when several offered services share the stage, or none has it', () => {
    expect(serviceTagForStage('A', SERVICE_TAG_IDS)).toBeUndefined()
    expect(serviceTagForStage('E', SERVICE_TAG_IDS)).toBeUndefined()
    expect(serviceTagForStage('B', SERVICE_TAG_IDS)).toBeUndefined()
    expect(serviceTagForStage('C', SERVICE_TAG_IDS)).toBeUndefined()
  })
})
