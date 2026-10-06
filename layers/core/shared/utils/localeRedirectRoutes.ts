import {
  CRAWLER_WORDS,
  EN_DOMAINS,
  LOCALE_COOKIE_NAME,
  RO_DOMAINS,
  RO_MD_COUNTRIES,
} from './resolveLocale'

type Condition =
  | { type: 'host'; value: string }
  | { type: 'header' | 'cookie'; key: string; value?: string }

export interface VercelRedirectRoute {
  src: string
  status: number
  headers: Record<string, string>
  has?: Condition[]
  missing?: Condition[]
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const anyCase = (word: string) =>
  [...word].map((char) => (/[a-z]/i.test(char) ? `[${char.toUpperCase()}${char.toLowerCase()}]` : escape(char))).join('')
const hostOn = (domains: string[]) => `^(.+\\.)?(${domains.map(escape).join('|')})(:\\d+)?$`

const choice = (locale?: 'ro' | 'en'): Condition => ({
  type: 'cookie',
  key: LOCALE_COOKIE_NAME,
  value: locale ? `^${locale}$` : '^(ro|en)$',
})
const roHost: Condition = { type: 'host', value: hostOn(RO_DOMAINS) }
const enHost: Condition = { type: 'host', value: hostOn(EN_DOMAINS) }
const roCountry: Condition = {
  type: 'header',
  key: 'x-vercel-ip-country',
  value: `^(${RO_MD_COUNTRIES.flatMap((code) => [code, code.toLowerCase()]).join('|')})$`,
}
const crawler: Condition = {
  type: 'header',
  key: 'user-agent',
  value: `^.*(${CRAWLER_WORDS.map(anyCase).join('|')}).*$`,
}

function redirect(from: '/' | '/en', to: '/' | '/en', has: Condition[], missing: Condition[]): VercelRedirectRoute {
  return {
    src: from === '/' ? '^/$' : '^/en$',
    status: 302,
    // Per-visitor decision: no shared cache may keep it.
    headers: { Location: to, 'Cache-Control': 'private, no-store' },
    ...(has.length ? { has } : {}),
    missing: [crawler, ...missing],
  }
}

/** resolveLocale() as Vercel routes, which run before the ISR cache: the home
 * pages can then be cached and still send each visitor to their language.
 * server/middleware/locale-redirect.ts keeps doing the same off Vercel. */
export function localeRedirectRoutes(): VercelRedirectRoute[] {
  return [
    redirect('/', '/en', [choice('en')], []),
    redirect('/', '/en', [enHost], [choice()]),
    redirect('/', '/en', [], [choice(), roHost, roCountry]),
    redirect('/en', '/', [choice('ro')], []),
    redirect('/en', '/', [roHost], [choice()]),
    redirect('/en', '/', [roCountry], [choice(), roHost, enHost]),
  ]
}
