import { describe, expect, it, vi } from 'vitest'
import { buildQualificationSubmission } from '#layers/qualifier/test-support/buildQualificationSubmission'
import { submitQualification, type SubmitQualificationDependencies } from './submitQualification'

const NOW = new Date('2026-01-15T10:00:00.000Z')

function buildDeps(overrides: Partial<SubmitQualificationDependencies> = {}): SubmitQualificationDependencies {
  return {
    notify: vi.fn(async () => 'sent' as const),
    checkRateLimit: vi.fn(async () => true),
    now: () => NOW,
    ...overrides,
  }
}

describe('submitQualification', () => {
  it('treats a filled honeypot as success without checking the rate limit or notifying', async () => {
    const deps = buildDeps()
    const result = await submitQualification(buildQualificationSubmission({ website: 'http://spam.example' }), deps)
    expect(result).toEqual({ outcome: 'honeypot' })
    expect(deps.checkRateLimit).not.toHaveBeenCalled()
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

  it('stops a rate-limited caller without notifying', async () => {
    const deps = buildDeps({ checkRateLimit: vi.fn(async () => false) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'rate_limited' })
    expect(deps.notify).not.toHaveBeenCalled()
  })

  it('notifies the team with the summary and reports delivery', async () => {
    const deps = buildDeps()
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'delivered' })
    expect(deps.notify).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Qualificare — Custom Engineering / AI — Ana Pop' }),
    )
  })

  it('reports a skipped delivery and logs only the routing outcome', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const deps = buildDeps({ notify: vi.fn(async () => 'skipped' as const) })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({ outcome: 'delivery_skipped' })
    expect(warn).toHaveBeenCalledWith(
      '[qualifier] submitQualification: notification skipped, submission not delivered',
      'stage A, route custom-engineering-ai, lang ro',
    )
    warn.mockRestore()
  })

  it('reports a delivery failure when the notifier throws', async () => {
    const cause = new Error('resend down')
    const deps = buildDeps({
      notify: vi.fn(async () => {
        throw cause
      }),
    })
    expect(await submitQualification(buildQualificationSubmission(), deps)).toEqual({
      outcome: 'delivery_failed',
      cause,
    })
  })
})
