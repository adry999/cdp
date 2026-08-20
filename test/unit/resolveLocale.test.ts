import { describe, expect, it } from 'vitest'
import { isCrawler, resolveLocale } from '../../shared/utils/resolveLocale'

describe('resolveLocale', () => {
  it('honors a valid override cookie regardless of geo or host', () => {
    expect(resolveLocale({ cookieLocale: 'en', geoCountry: 'RO', host: 'codepedia.md' })).toBe('en')
    expect(resolveLocale({ cookieLocale: 'ro', geoCountry: 'US', host: 'example.com' })).toBe('ro')
  })

  it('ignores an invalid cookie value and falls through to geo', () => {
    expect(resolveLocale({ cookieLocale: 'fr', geoCountry: 'US' })).toBe('en')
  })

  it('returns ro for Romania and Moldova geo, en for anywhere else', () => {
    expect(resolveLocale({ geoCountry: 'RO' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'MD' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'md' })).toBe('ro')
    expect(resolveLocale({ geoCountry: 'US' })).toBe('en')
    expect(resolveLocale({ geoCountry: 'DE' })).toBe('en')
  })

  it('falls back to domain when geo is unavailable', () => {
    expect(resolveLocale({ host: 'codepedia.md' })).toBe('ro')
    expect(resolveLocale({ host: 'codepedia.ro' })).toBe('ro')
    expect(resolveLocale({ host: 'www.codepedia.md' })).toBe('ro')
    expect(resolveLocale({ host: 'localhost:3000' })).toBe('en')
    expect(resolveLocale({ host: 'example.com' })).toBe('en')
  })

  it('defaults to en when nothing resolves', () => {
    expect(resolveLocale({})).toBe('en')
  })

  it('prefers geo over domain when both are present', () => {
    expect(resolveLocale({ geoCountry: 'US', host: 'codepedia.md' })).toBe('en')
  })
})

describe('isCrawler', () => {
  it('recognizes common search crawlers', () => {
    expect(isCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
    expect(isCrawler('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true)
    expect(isCrawler('Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)')).toBe(true)
    expect(isCrawler('Slurp')).toBe(true)
    expect(isCrawler('facebookexternalhit/1.1')).toBe(true)
  })

  it('does not flag a normal browser', () => {
    expect(
      isCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'),
    ).toBe(false)
  })

  it('treats a missing user agent as not a crawler', () => {
    expect(isCrawler(undefined)).toBe(false)
    expect(isCrawler(null)).toBe(false)
  })
})
