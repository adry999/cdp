import { readLimitedBody } from '#layers/core/server/utils/readLimitedBody'
import { requireAdmin } from '#layers/core/server/utils/requireAdmin'
import { nodeFetchDeps } from '#layers/news/server/services/nodeFetchDeps'
import { previewNewsSource } from '#layers/news/server/services/previewNewsSource'

const MAX_URL_LENGTH = 2048

// Admin-only: fetches a public page on the server and returns the few fields it declares (title,
// site name, author, date) so the editor can pre-fill them. All SSRF defences live in previewNewsSource.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // Malformed JSON falls through to the "Link invalid." answer below; an oversized body keeps its 413.
  const body = (await readLimitedBody(event).catch((error: unknown) => {
    if (isError(error) && error.statusCode === 413) throw error
    return null
  })) as { url?: unknown } | null
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  if (!url || url.length > MAX_URL_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Link invalid.' })
  }

  const result = await previewNewsSource(url, nodeFetchDeps)
  switch (result.outcome) {
    case 'ok':
      return result.preview
    case 'invalid':
    case 'blocked':
      throw createError({ statusCode: 400, statusMessage: 'Link-ul nu poate fi folosit (doar pagini web publice, http sau https).' })
    case 'not_html':
      throw createError({ statusCode: 422, statusMessage: 'Link-ul nu duce la o pagină web.' })
    case 'too_many_redirects':
    case 'unreachable':
      throw createError({ statusCode: 502, statusMessage: 'Pagina nu a putut fi citită.' })
  }
})
