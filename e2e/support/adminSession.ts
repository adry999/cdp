import type { BrowserContext } from '@playwright/test'

// A fabricated admin session for e2e on the production build. The browser's calls to Supabase are
// answered here; the server's own calls fail with it (the JWT is not signed), which the admin
// already tolerates. Tests that need a row the server would read mock the endpoint instead.
export const supabaseUrl = (process.env.NUXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')

const user = {
  id: '00000000-0000-4000-8000-0000000000e2',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@example.invalid',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}

function fakeSession() {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const claims = { sub: user.id, aud: 'authenticated', role: 'authenticated', email: user.email, aal: 'aal2', iat: now, exp: now + 3600 }
  return {
    access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.e2e`,
    refresh_token: 'e2e',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    user,
  }
}

export async function signInAsFakeAdmin(context: BrowserContext) {
  // Same name and encoding as @nuxtjs/supabase / @supabase/ssr: sb-<first host label>-auth-token, base64url JSON.
  const name = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const value = `base64-${Buffer.from(JSON.stringify(fakeSession())).toString('base64url')}`
  await context.addCookies([{ name, value, domain: 'localhost', path: '/' }])

  const cors = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range' }
  await context.route(`${supabaseUrl}/auth/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(user) }),
  )
  await context.route(`${supabaseUrl}/rest/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', headers: { ...cors, 'content-range': '*/0' }, body: '[]' }),
  )
}
