import { expect, test } from '@playwright/test'

// Runs against the server booted with NUXT_ORIGIN_SECRET (e2e/support/serve.mjs, :3014).
const SECRET_HEADER = { 'x-codepedia-origin': 'e2e-origin-secret' }

test('refuses requests without the origin header', async ({ request }) => {
  expect((await request.get('/', { headers: { 'x-vercel-ip-country': 'RO' } })).status()).toBe(403)
  expect((await request.get('/api/projects')).status()).toBe(403)
})

test('refuses requests with a wrong origin header', async ({ request }) => {
  const response = await request.get('/api/projects', { headers: { 'x-codepedia-origin': 'nope' } })
  expect(response.status()).toBe(403)
})

test('answers requests with the origin header', async ({ request }) => {
  const response = await request.get('/api/projects', { headers: SECRET_HEADER })
  expect(response.status()).toBe(200)
})

// The page loads its data with an internal `$fetch('/api/projects')` that carries no header; it must not be refused.
test('server-side data fetches are not blocked by the guard', async ({ request }) => {
  const list = await request.get('/api/projects', { headers: SECRET_HEADER })
  const [project] = (await list.json()) as { slug_ro: string }[]
  test.skip(!project, 'No published projects to test against')
  const response = await request.get('/proiecte', { headers: SECRET_HEADER })
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain(`/proiecte/${project?.slug_ro}`)
})
