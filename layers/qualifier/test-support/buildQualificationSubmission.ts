import type { RawQualificationSubmission } from '#layers/qualifier/domain/qualification'

export function buildQualificationSubmission(
  overrides: Partial<RawQualificationSubmission> = {},
): RawQualificationSubmission {
  return {
    name: 'Ana Pop',
    email: 'ana@example.com',
    handle: '@ana',
    notes: 'Vreau un site nou.',
    stage: 'A',
    budget: '2to5k',
    lang: 'ro',
    website: '',
    ...overrides,
  }
}
