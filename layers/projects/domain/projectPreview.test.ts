import { describe, expect, it } from 'vitest'
import { projectPreviewPath } from './projectPreview'

describe('projectPreviewPath', () => {
  // Under /admin: the admin session guard, `private, no-store` and the robots.txt exclusion all apply.
  it('puts the preview under /admin, away from the cached /proiecte/** pages', () => {
    expect(projectPreviewPath('saas-logistica')).toBe('/admin/preview/projects/saas-logistica')
  })
})
