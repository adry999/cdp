import { describe, expect, it } from 'vitest'
import { toAppError } from './toAppError'

describe('toAppError', () => {
  it('passes an AppError through unchanged', () => {
    const appError = { code: 'rate_limited' as const, message: 'Prea multe cereri' }
    expect(toAppError(appError)).toBe(appError)
  })

  it.each([
    [400, 'validation'],
    [404, 'not_found'],
    [429, 'rate_limited'],
    [502, 'upstream'],
  ] as const)('maps a fetch error with status %i to %s', (statusCode, code) => {
    const fetchError = Object.assign(new Error('Request failed'), { statusCode })
    expect(toAppError(fetchError)).toEqual({ code, message: 'Request failed', cause: fetchError })
  })

  it('maps a fetch error with an unmapped status to unexpected', () => {
    const fetchError = Object.assign(new Error('Server error'), { statusCode: 500 })
    expect(toAppError(fetchError)).toEqual({ code: 'unexpected', message: 'Server error', cause: fetchError })
  })

  it('maps a plain error to unexpected with its message', () => {
    const error = new Error('boom')
    expect(toAppError(error)).toEqual({ code: 'unexpected', message: 'boom', cause: error })
  })

  it('maps a non-error value to unexpected with a generic message', () => {
    expect(toAppError('nope')).toEqual({ code: 'unexpected', message: 'Unexpected error', cause: 'nope' })
  })
})
