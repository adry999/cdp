import { describe, expect, it, vi } from 'vitest'
import { hasAppUserRow } from './appUserLookup'

describe('hasAppUserRow', () => {
  it('is true when the app_users row exists', async () => {
    await expect(hasAppUserRow(async () => ({ data: { id: 'u1' }, error: null }))).resolves.toBe(true)
  })

  it('is false when there is no row and no error', async () => {
    await expect(hasAppUserRow(async () => ({ data: null, error: null }))).resolves.toBe(false)
  })

  it('answers 500 with a generic message on a database error, and logs the cause', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const pending = hasAppUserRow(async () => ({ data: null, error: { message: 'relation "app_users" is unavailable' } }))
    await expect(pending).rejects.toMatchObject({ statusCode: 500, statusMessage: 'Something went wrong. Please try again.' })
    expect(spy).toHaveBeenCalledWith('[api] requireAdmin app_users lookup:', 'relation "app_users" is unavailable')
    spy.mockRestore()
  })
})
