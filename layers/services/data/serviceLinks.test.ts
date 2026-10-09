import { describe, expect, it } from 'vitest'
import { stageForServiceParam } from '#layers/core/shared/utils/serviceStage'
import { SERVICE_LINKS } from './serviceLinks'

describe('SERVICE_LINKS', () => {
  it('matches the route-slug -> stage table the contact form uses', () => {
    for (const link of SERVICE_LINKS) {
      expect(stageForServiceParam(link.routeSlug.ro), link.routeSlug.ro).toBe(link.qualifierStage)
      expect(stageForServiceParam(link.routeSlug.en), link.routeSlug.en).toBe(link.qualifierStage)
    }
  })
})
