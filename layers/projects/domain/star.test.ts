import { describe, expect, it } from 'vitest'
import { isLinkKind, pickJson, toConstraints, toFigures, toIncident, toLinks, toStrings } from './star'

describe('toFigures', () => {
  it('trims values and drops entries with neither v nor k', () => {
    expect(toFigures([{ v: ' −35% ', k: ' pierderi ' }, { v: '', k: '  ' }, { v: '2×', k: '' }])).toEqual([
      { v: '−35%', k: 'pierderi' },
      { v: '2×', k: '' },
    ])
  })

  it('drops malformed entries instead of throwing', () => {
    expect(toFigures([null, 'x', 3, ['a'], { v: '1', k: 'ok' }])).toEqual([{ v: '1', k: 'ok' }])
  })

  it('is empty for null, a non-array, or a missing column', () => {
    expect(toFigures(null)).toEqual([])
    expect(toFigures(undefined)).toEqual([])
    expect(toFigures({ v: '1', k: 'x' })).toEqual([])
  })
})

describe('toConstraints', () => {
  it('keeps entries with either side filled and trims them', () => {
    expect(toConstraints([{ k: ' Termen ', v: ' 10 săptămâni ' }, { k: '', v: '' }, { k: 'Buget', v: '' }])).toEqual([
      { k: 'Termen', v: '10 săptămâni' },
      { k: 'Buget', v: '' },
    ])
  })

  it('drops non-object entries', () => {
    expect(toConstraints(['Termen', null, { k: 'A', v: 'B' }])).toEqual([{ k: 'A', v: 'B' }])
  })
})

describe('toStrings', () => {
  it('trims and drops blank strings and non-strings', () => {
    expect(toStrings([' Unu ', '', '   ', 4, { a: 1 }, 'Doi'])).toEqual(['Unu', 'Doi'])
  })
})

describe('toIncident', () => {
  it('is null when every field is empty', () => {
    expect(toIncident(null)).toBeNull()
    expect(toIncident(undefined)).toBeNull()
    expect(toIncident({ found: ' ', risk: '', action: '', outcome: [] })).toBeNull()
    expect(toIncident({})).toBeNull()
  })

  it('is null for a non-object value', () => {
    expect(toIncident(['found'])).toBeNull()
    expect(toIncident('found')).toBeNull()
  })

  it('is kept when only the outcome has content', () => {
    expect(toIncident({ outcome: [{ v: '3', k: 'zile' }] })).toEqual({
      found: '',
      risk: '',
      action: '',
      outcome: [{ v: '3', k: 'zile' }],
    })
  })

  it('trims text fields and drops malformed outcome entries', () => {
    expect(
      toIncident({ found: ' Furnizor ', risk: '', action: 'Am schimbat ', outcome: [null, { v: '1', k: 'x' }] }),
    ).toEqual({
      found: 'Furnizor',
      risk: '',
      action: 'Am schimbat',
      outcome: [{ v: '1', k: 'x' }],
    })
  })
})

describe('toLinks', () => {
  it('keeps http and https links with a known kind', () => {
    expect(
      toLinks([
        { kind: 'live', url: 'https://example.com', note_ro: 'Vezi live', note_en: null },
        { kind: 'figma', url: 'http://figma.com/file/1', note_ro: null, note_en: '  ' },
      ]),
    ).toEqual([
      { kind: 'live', url: 'https://example.com', note_ro: 'Vezi live', note_en: null },
      { kind: 'figma', url: 'http://figma.com/file/1', note_ro: null, note_en: null },
    ])
  })

  it('drops non-http urls, unknown kinds and non-object entries', () => {
    expect(
      toLinks([
        { kind: 'live', url: 'javascript:alert(1)' },
        { kind: 'live', url: 'example.com' },
        { kind: 'github', url: 'https://github.com/x' },
        { kind: 'preview', url: '' },
        'https://example.com',
        null,
        { kind: 'preview', url: 'https://ok.example' },
      ]),
    ).toEqual([{ kind: 'preview', url: 'https://ok.example', note_ro: null, note_en: null }])
  })

  it('trims the url before checking it', () => {
    expect(toLinks([{ kind: 'live', url: '  https://example.com ' }])).toEqual([
      { kind: 'live', url: 'https://example.com', note_ro: null, note_en: null },
    ])
  })

  it('is empty for a non-array column', () => {
    expect(toLinks(null)).toEqual([])
    expect(toLinks({ kind: 'live', url: 'https://example.com' })).toEqual([])
  })
})

describe('isLinkKind', () => {
  it('accepts only the known kinds', () => {
    expect(isLinkKind('live')).toBe(true)
    expect(isLinkKind('preview')).toBe(true)
    expect(isLinkKind('figma')).toBe(true)
    expect(isLinkKind('github')).toBe(false)
    expect(isLinkKind(null)).toBe(false)
  })
})

describe('pickJson', () => {
  it('uses the EN value for the en locale when it has content', () => {
    expect(pickJson([{ v: 'ro' }], [{ v: 'en' }], 'en')).toEqual([{ v: 'en' }])
  })

  it('uses the RO value for the ro locale', () => {
    expect(pickJson([{ v: 'ro' }], [{ v: 'en' }], 'ro')).toEqual([{ v: 'ro' }])
  })

  it('falls back to RO when EN is null', () => {
    expect(pickJson(['ro'], null, 'en')).toEqual(['ro'])
  })

  it('falls back to RO when EN is an empty array', () => {
    expect(pickJson(['ro'], [], 'en')).toEqual(['ro'])
  })

  it('falls back to RO when EN is an empty object', () => {
    expect(pickJson({ found: 'ro' }, {}, 'en')).toEqual({ found: 'ro' })
  })
})
