import { describe, expect, it } from 'vitest'
import type { InlineNode } from './body'
import { compactTableColumns } from './table'

function header(...labels: string[]): InlineNode[][] {
  return labels.map((text) => [{ type: 'text', text }])
}

describe('compactTableColumns', () => {
  it('compacts the first column and keeps the minimum on long headers', () => {
    expect(compactTableColumns(header('Tip', 'Ce include', 'Preț orientativ', 'Termen'))).toEqual([true, false, false, false])
  })

  it('compacts a short header anywhere, such as a # column', () => {
    expect(compactTableColumns(header('Proces', '#', 'Nr.', 'Ce face'))).toEqual([true, true, true, false])
  })

  it('reads the text inside formatting and ignores surrounding spaces', () => {
    const head: InlineNode[][] = [
      [{ type: 'text', text: 'Criteriu' }],
      [{ type: 'strong', children: [{ type: 'text', text: ' ID ' }] }],
      [{ type: 'em', children: [{ type: 'text', text: 'WordPress' }] }],
    ]
    expect(compactTableColumns(head)).toEqual([true, true, false])
  })
})
