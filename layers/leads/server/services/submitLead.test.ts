import { describe, expect, it, vi } from 'vitest'
import type { StageId } from '#layers/core/shared/types/service-stage'
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'
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
    confirm: vi.fn(async () => 'sent' as const),
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
    expect(deps.confirm).not.toHaveBeenCalled()
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
      fields: [
        { label: 'Nume', value: 'Ana Popescu' },
        { label: 'Email', value: 'ana@example.com' },
        { label: 'Companie', value: 'Acme' },
        { label: 'Buget', value: '2.000 – 5.000 EUR' },
      ],
      message: { label: 'Mesaj', text: 'Vrem un portal pentru clienți.' },
      replyTo: 'ana@example.com',
    })
    expect(deps.confirm).toHaveBeenCalledWith({ to: 'ana@example.com', name: 'Ana Popescu', lang: 'ro' })
  })

  it('rejects an unknown stage before checking the rate limit', async () => {
    const { deps } = buildDeps()
    const stage = 'Z' as unknown as StageId
    const result = await submitLead(buildContactSubmission({ stage }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { stage: 'invalid_stage' } })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('saves the stage and names it in the notification', async () => {
    const { deps, savedRecords } = buildDeps()
    await submitLead(buildContactSubmission({ stage: 'C' }), null, deps)
    expect(savedRecords[0]?.stage).toBe('C')
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining([{ label: 'Etapă', value: 'Scalare' }]),
      }),
    )
  })

  it('rejects an unknown service before checking the rate limit', async () => {
    const { deps } = buildDeps()
    const service = 'seo' as unknown as ServiceTagId
    const result = await submitLead(buildContactSubmission({ service }), null, deps)
    expect(result).toEqual({ outcome: 'invalid', errors: { service: 'invalid_service' } })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
  })

  it('saves the service and names it in the notification', async () => {
    const { deps, savedRecords } = buildDeps()
    await submitLead(buildContactSubmission({ service: 'web-app', stage: 'A' }), null, deps)
    expect(savedRecords[0]?.service).toBe('web-app')
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining([
          { label: 'Serviciu', value: 'Aplicație web' },
          { label: 'Etapă', value: 'Design → cod' },
        ]),
      }),
    )
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
    expect(warn).toHaveBeenCalledWith('[leads] notification failed', 'resend down')
    warn.mockRestore()
  })

  it('still accepts the lead when the visitor confirmation fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { deps, savedRecords } = buildDeps({
      confirm: vi.fn(async () => {
        throw new Error('bounced')
      }),
    })
    expect(await submitLead(buildContactSubmission(), null, deps)).toEqual({ outcome: 'accepted' })
    expect(savedRecords).toHaveLength(1)
    expect(deps.notify).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('[leads:confirmation] notification failed', 'bounced')
    warn.mockRestore()
  })
})
