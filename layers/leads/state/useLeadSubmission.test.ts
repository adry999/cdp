import { describe, expect, it, vi } from 'vitest'
import { buildContactSubmission } from '#layers/leads/test-support/buildContactSubmission'
import { useLeadSubmission } from './useLeadSubmission'

describe('useLeadSubmission', () => {
  it('blocks a submission with blank required fields and sends nothing', async () => {
    const post = vi.fn(async () => ({ success: true }))
    const { status, fieldErrors, submit } = useLeadSubmission({ post })

    expect(await submit(buildContactSubmission({ name: '', message: '' }))).toBe(false)
    expect(fieldErrors.value).toEqual({ name: 'required', message: 'required' })
    expect(status.value).toBe('idle')
    expect(post).not.toHaveBeenCalled()
  })

  it('posts a valid submission and ends in success', async () => {
    const post = vi.fn(async () => ({ success: true }))
    const { status, error, submit } = useLeadSubmission({ post })
    const submission = buildContactSubmission()

    expect(await submit(submission, 'turnstile-token')).toBe(true)
    expect(post).toHaveBeenCalledWith(submission, 'turnstile-token')
    expect(status.value).toBe('success')
    expect(error.value).toBeNull()
  })

  it('maps a failed request to an AppError and ends in error', async () => {
    const failure = Object.assign(new Error('Too many requests'), { statusCode: 429 })
    const post = vi.fn(async () => {
      throw failure
    })
    const { status, error, submit } = useLeadSubmission({ post })

    expect(await submit(buildContactSubmission())).toBe(false)
    expect(status.value).toBe('error')
    expect(error.value).toEqual({ code: 'rate_limited', message: 'Too many requests', cause: failure })
  })

  it('ignores a second submit while the first is still pending', async () => {
    let finish: (value: unknown) => void = () => {}
    const post = vi.fn(
      () =>
        new Promise<unknown>((resolve) => {
          finish = resolve
        }),
    )
    const { status, submit } = useLeadSubmission({ post })

    const first = submit(buildContactSubmission())
    expect(await submit(buildContactSubmission())).toBe(false)
    finish({ success: true })

    expect(await first).toBe(true)
    expect(post).toHaveBeenCalledTimes(1)
    expect(status.value).toBe('success')
  })

  it('re-validates on edit only after the first submit', async () => {
    const post = vi.fn(async () => ({ success: true }))
    const { fieldErrors, submit, revalidate } = useLeadSubmission({ post })

    revalidate(buildContactSubmission({ name: '' }))
    expect(fieldErrors.value).toEqual({})

    await submit(buildContactSubmission({ name: '', email: 'ana' }))
    expect(fieldErrors.value).toEqual({ name: 'required', email: 'invalid_email' })

    revalidate(buildContactSubmission({ name: 'Ana', email: 'ana' }))
    expect(fieldErrors.value).toEqual({ email: 'invalid_email' })
    revalidate(buildContactSubmission({ name: 'Ana' }))
    expect(fieldErrors.value).toEqual({})
    expect(post).not.toHaveBeenCalled()
  })
})
