import { describe, expect, it, vi } from 'vitest'
import type { LeadRecord } from '#layers/leads/domain/lead'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import { submitLead, type SubmitLeadDependencies } from './submitLead'

function buildDeps(overrides: Partial<SubmitLeadDependencies> = {}) {
  const savedRecords: LeadRecord[] = []
  const deps: SubmitLeadDependencies = {
    repository: {
      insertLead: vi.fn(async (record: LeadRecord) => {
        savedRecords.push(record)
      }),
    },
    notify: vi.fn(async () => 'sent' as const),
    checkRateLimit: vi.fn(async () => true),
    ...overrides,
  }
  return { deps, savedRecords }
}

describe('submitLead', () => {
  it('returns honeypot and saves nothing when the trap field is filled', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ website: 'http://spam.example' }), null, deps)
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('returns invalid with a code per blank required field', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ name: '', email: '', message: '' }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { name: 'required', email: 'required', message: 'required' } })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('rejects a malformed email before checking the rate limit', async () => {
    const { deps } = buildDeps()
    const result = await submitLead(buildContactSubmission({ email: 'not-an-email' }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { email: 'invalid_email' } })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('returns rate_limited and saves nothing when the caller is over the limit', async () => {
    const { deps } = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'rate_limited' })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('saves the lead and notifies the team on a valid submission', async () => {
    const { deps, savedRecords } = buildDeps()
    const result = await submitLead(buildContactSubmission({ company: 'Acme' }), 'https://codepedia.md/', deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(savedRecords).toHaveLength(1)
    expect(savedRecords[0]).toMatchObject({ name: 'Ana Popescu', company: 'Acme', referrer: 'https://codepedia.md/' })
    expect(deps.notify).toHaveBeenCalledWith({
      subject: 'Solicitare nouă — Ana Popescu',
      lines: [
        'Nume: Ana Popescu',
        'Email: ana@example.com',
        'Companie: Acme',
        'Buget: 2.000 – 5.000 EUR',
        '',
        'Vrem un portal pentru clienți.',
      ],
    })
  })

  it('still accepts the lead when the team notification fails, logging only the message', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps, savedRecords } = buildDeps({
      notify: vi.fn(async () => {
        throw new Error('resend down')
      }),
    })
    const result = await submitLead(buildContactSubmission(), null, deps)
    expect(result).toEqual({ outcome: 'accepted' })
    expect(savedRecords).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('[leads] submitLead: team notification failed', 'resend down')
    warn.mockRestore()
  })
})
