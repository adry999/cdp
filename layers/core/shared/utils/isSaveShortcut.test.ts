import { describe, expect, it } from 'vitest'
import { isSaveShortcut } from './isSaveShortcut'

const base = { key: 's', ctrlKey: false, metaKey: false, altKey: false }

describe('isSaveShortcut', () => {
  it('accepts Ctrl+S and Cmd+S, any letter case', () => {
    expect(isSaveShortcut({ ...base, ctrlKey: true })).toBe(true)
    expect(isSaveShortcut({ ...base, metaKey: true, key: 'S' })).toBe(true)
  })

  it('ignores a bare S, other keys and Alt combinations', () => {
    expect(isSaveShortcut(base)).toBe(false)
    expect(isSaveShortcut({ ...base, ctrlKey: true, key: 'a' })).toBe(false)
    expect(isSaveShortcut({ ...base, ctrlKey: true, altKey: true })).toBe(false)
  })
})
