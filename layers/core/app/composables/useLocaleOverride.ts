import { LOCALE_COOKIE_NAME } from '#layers/core/shared/utils/resolveLocale'

// The visitor's manual RO/EN choice, persisted in the `codepedia_locale` cookie;
// locale-redirect lets it override geo-IP/domain detection on `/` and `/en`.
export function useLocaleOverride() {
  const localeOverride = useCookie<string | null>(LOCALE_COOKIE_NAME, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  function setLocaleOverride(loc: 'ro' | 'en') {
    localeOverride.value = loc
  }

  return { localeOverride, setLocaleOverride }
}
