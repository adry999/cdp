import { describe, expect, it } from 'vitest'
import { focusTrapTarget } from './focusTrap'

const ITEMS = ['close', 'option', 'submit']

describe('focusTrapTarget', () => {
  it('returns null when the container has nothing focusable', () => {
    expect(focusTrapTarget([], null, false, false)).toBeNull()
  })

  it('wraps Tab from the last element to the first', () => {
    expect(focusTrapTarget(ITEMS, 'submit', false, true)).toBe('close')
  })

  it('wraps Shift+Tab from the first element to the last', () => {
    expect(focusTrapTarget(ITEMS, 'close', true, true)).toBe('submit')
  })

  it('sends Shift+Tab from outside the container to the last element', () => {
    expect(focusTrapTarget(ITEMS, 'page-link', true, false)).toBe('submit')
  })

  it('leaves Tab between inner elements to the browser', () => {
    expect(focusTrapTarget(ITEMS, 'option', false, true)).toBeNull()
    expect(focusTrapTarget(ITEMS, 'option', true, true)).toBeNull()
  })
})
