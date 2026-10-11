import { describe, expect, it } from 'vitest'
import { projectsForService } from './relatedProjects'

describe('projectsForService', () => {
  it('keeps only rows tagged with the service', () => {
    const rows = [
      { id: 1, service_tag: 'website' },
      { id: 2, service_tag: 'shopify' },
      { id: 3, service_tag: null },
    ]
    expect(projectsForService(rows, 'website')).toEqual([{ id: 1, service_tag: 'website' }])
  })
})
