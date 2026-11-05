/** Request header that carries the Turnstile token from the public forms to their API routes. */
export const TURNSTILE_TOKEN_HEADER = 'x-turnstile-token'

/** Headers for a form submission: the token header only when the widget produced one. */
export function turnstileHeaders(token: string | undefined): Record<string, string> {
  return token ? { [TURNSTILE_TOKEN_HEADER]: token } : {}
}
