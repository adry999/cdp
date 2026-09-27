import { describe, expect, it, vi } from 'vitest'
import { buildQualificationSubmission } from '#layers/qualifier/test-support/buildQualificationSubmission'
import { submitQualification, type SubmitQualificationDependencies } from './submitQualification'

const NOW = new Date('2026-01-15T10:00:00.000Z')

function buildDeps(overrides: Partial<SubmitQualificationDependencies> = {}): SubmitQualificationDependencies {
  return {
    repository: { insertLead: vi.fn(async () => undefined) },
    notify: vi.fn(async () => 'sent' as const),
    checkRateLimit: vi.fn(async () => true),
    now: () => NOW,
    ...overrides,
  }
}

describe('submitQualification', () => {
  it('treats a filled honeypot as success without checking the rate limit, persisting or notifying', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission({ website: 'http://spam.example' }), deps)
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('rejects an invalid email before checking the rate limit', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission({ email: 'not-an-email' }), deps)
    expect(result).toEqual({ outcome: 'invalid' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('rejects an empty body as invalid', async () => {
    const deps = buildDeps()
    expect(await submitQualification({}, deps)).toEqual({ outcome: 'invalid' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
  })

  it('stops a rate-limited caller without persisting or notifying', async () => {
    const deps = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'rate_limited' })
    expect(deps.repository.insertLead).not.toHaveBeenCalled()
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('persists the submission and notifies the team with the summary', async () => {
    const deps = buildDeps()
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'accepted' })
    expect(deps.repository.insertLead).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ana Pop', email: 'ana@example.com', source: 'qualifier:custom-engineering-ai' }),
    )
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Qualificare — Custom Engineering / AI — Ana Pop' }),
    )
  })

  it('persists the submission even when the notification is skipped', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const deps = buildDeps({ notify: vi.fn(async () => 'skipped' as const) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'accepted' })
    expect(deps.repository.insertLead).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      '[qualifier] submitQualification: notification skipped, submission was still saved',
    )
    warn.mockRestore()
  })

  it('persists the submission even when the notifier throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const cause = new Error('resend down')
    const deps = buildDeps({
      notify: vi.fn(async () => {
        throw cause
      }),
    })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'accepted' })
    expect(deps.repository.insertLead).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(
      '[qualifier] submitQualification: team notification failed',
      cause.message,
    )
    warn.mockRestore()
  })
})
