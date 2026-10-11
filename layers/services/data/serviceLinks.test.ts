import { describe, expect, it } from 'vitest'
import { SERVICE_TAG_LABELS_RO } from '#layers/core/shared/types/service-tag'
import { serviceTagForParam, stageForServiceParam, stageForServiceTag } from '#layers/core/shared/utils/serviceStage'
import { SERVICE_LINKS } from './serviceLinks'

describe('SERVICE_LINKS', () => {
  it('matches the route-slug -> stage table the contact form uses', () => {
    for (const link of SERVICE_LINKS) {
      expect(stageForServiceParam(link.routeSlug.ro), link.routeSlug.ro).toBe(link.qualifierStage)
      expect(stageForServiceParam(link.routeSlug.en), link.routeSlug.en).toBe(link.qualifierStage)
    }
  })

  it('matches the route-slug -> service and service -> stage tables in core', () => {
    for (const link of SERVICE_LINKS) {
      expect(serviceTagForParam(link.routeSlug.ro), link.routeSlug.ro).toBe(link.slug)
      expect(serviceTagForParam(link.routeSlug.en), link.routeSlug.en).toBe(link.slug)
      expect(stageForServiceTag(link.slug), link.slug).toBe(link.qualifierStage)
    }
  })

  it('matches the Romanian service labels the admin uses', () => {
    for (const link of SERVICE_LINKS) expect(SERVICE_TAG_LABELS_RO[link.slug], link.slug).toBe(link.name.ro)
  })
})
