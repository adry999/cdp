import { describe, expect, it } from 'vitest'
import { checkAdmin } from './checkAdmin'

describe('checkAdmin', () => {
  it('is unauthenticated without a session, without touching app_users', async () => {
    const looked: string[] = []
    const result = await checkAdmin({
      getUser: async () => null,
      isAppUser: async (id) => {
        looked.push(id)
        return true
      },
    })
    expect(result).toEqual({ outcome: 'unauthenticated' })
    expect(looked).toEqual([])
  })

  it('is forbidden when the user has no app_users row', async () => {
    const result = await checkAdmin({ getUser: async () => ({ id: 'u1' }), isAppUser: async () => false })
    expect(result).toEqual({ outcome: 'forbidden' })
  })

  it('returns the user when the app_users row exists', async () => {
    const asked: string[] = []
    const result = await checkAdmin({
      getUser: async () => ({ id: 'u1' }),
      isAppUser: async (id) => {
        asked.push(id)
        return true
      },
    })
    expect(result).toEqual({ outcome: 'admin', user: { id: 'u1' } })
    expect(asked).toEqual(['u1'])
  })
})
