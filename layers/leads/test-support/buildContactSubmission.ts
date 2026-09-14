import type { ContactSubmission } from '#layers/leads/domain/lead'

export function buildContactSubmission(overrides: Partial<ContactSubmission> = {}): ContactSubmission {
  return {
    name: 'Ana Popescu',
    email: 'ana@example.com',
    company: '',
    message: 'Vrem un portal pentru clienți.',
    budget: '2to5k',
    source: '',
    lang: 'ro',
    page: '/',
    website: '',
    ...overrides,
  }
}
