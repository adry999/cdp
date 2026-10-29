import { describe, expect, it } from 'vitest'
import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  followsSystemTheme,
  oppositeTheme,
  resolveInitialTheme,
  type Theme,
} from './theme'

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

  it('opens light without a stored choice where the page does not follow the system', () => {
    expect(resolveInitialTheme(null, true, false)).toBe('light')
    expect(resolveInitialTheme('dark', false, false)).toBe('dark')
  })
})

describe('followsSystemTheme', () => {
  it('is false only for the admin', () => {
    expect(followsSystemTheme('/admin')).toBe(false)
    expect(followsSystemTheme('/admin/projects')).toBe(false)
    expect(followsSystemTheme('/')).toBe(true)
    expect(followsSystemTheme('/administratie')).toBe(true)
  })
})

describe('oppositeTheme', () => {
  it('flips', () => {
    expect(oppositeTheme('dark')).toBe('light')
    expect(oppositeTheme('light')).toBe('dark')
  })
})

describe('THEME_INIT_SCRIPT', () => {
  function run(stored: string | null, prefersDark: boolean, storageThrows = false, pathname = '/') {
    const documentElement = { dataset: {} as { theme?: string } }
    const localStorage = {
      getItem: (key: string) => {
        if (storageThrows) throw new Error('blocked')
        return key === THEME_STORAGE_KEY ? stored : null
      },
    }
    const matchMedia = () => ({ matches: prefersDark })
    new Function('localStorage', 'matchMedia', 'document', 'location', THEME_INIT_SCRIPT)(
      localStorage,
      matchMedia,
      { documentElement },
      { pathname },
    )
    return documentElement.dataset.theme
  }

  it('agrees with resolveInitialTheme', () => {
    const stored: (string | null)[] = [null, 'light', 'dark', 'junk']
    for (const s of stored) {
      for (const prefersDark of [true, false]) {
        for (const pathname of ['/', '/en/work', '/admin', '/admin/projects']) {
          expect(run(s, prefersDark, false, pathname)).toBe(
            resolveInitialTheme(s, prefersDark, followsSystemTheme(pathname)) satisfies Theme,
          )
        }
      }
    }
  })

  it('does not throw when storage is blocked', () => {
    expect(run(null, true, true)).toBeUndefined()
  })
})
