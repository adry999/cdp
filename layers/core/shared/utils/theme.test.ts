import { describe, expect, it } from 'vitest'
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY, oppositeTheme, resolveInitialTheme, type Theme } from './theme'

describe('resolveInitialTheme', () => {
  it('prefers a stored choice over the system', () => {
    expect(resolveInitialTheme('light', true)).toBe('light')
    expect(resolveInitialTheme('dark', false)).toBe('dark')
  })

  it('follows the system without a valid stored choice', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
    expect(resolveInitialTheme(undefined, false)).toBe('light')
    expect(resolveInitialTheme('sepia', true)).toBe('dark')
  })
})

describe('oppositeTheme', () => {
  it('flips', () => {
    expect(oppositeTheme('dark')).toBe('light')
    expect(oppositeTheme('light')).toBe('dark')
  })
})

describe('THEME_INIT_SCRIPT', () => {
  function run(stored: string | null, prefersDark: boolean, storageThrows = false) {
    const documentElement = { dataset: {} as { theme?: string } }
    const localStorage = {
      getItem: (key: string) => {
        if (storageThrows) throw new Error('blocked')
        return key === THEME_STORAGE_KEY ? stored : null
      },
    }
    const matchMedia = () => ({ matches: prefersDark })
    new Function('localStorage', 'matchMedia', 'document', THEME_INIT_SCRIPT)(localStorage, matchMedia, {
      documentElement,
    })
    return documentElement.dataset.theme
  }

  it('agrees with resolveInitialTheme', () => {
    const stored: (string | null)[] = [null, 'light', 'dark', 'junk']
    for (const s of stored) {
      for (const prefersDark of [true, false]) {
        expect(run(s, prefersDark)).toBe(resolveInitialTheme(s, prefersDark) satisfies Theme)
      }
    }
  })

  it('does not throw when storage is blocked', () => {
    expect(run(null, true, true)).toBeUndefined()
  })
})
