import { toAppError } from '#layers/core/shared/utils/toAppError'

type Fetcher = typeof $fetch

/** Project images live in R2; the browser only talks to the admin endpoints, never to the bucket. */
export function createProjectsMediaRepository(fetcher: Fetcher = $fetch) {
  return {
    /**
     * Uploads one image below `prefix` and returns its public URL. The server picks a fresh key, so a
     * replaced image never overwrites the file the published page still serves.
     */
    async upload(prefix: string, file: File): Promise<string> {
      const body = new FormData()
      body.append('prefix', prefix)
      body.append('file', file)
      try {
        const { url } = await fetcher<{ url: string }>('/api/admin/media', { method: 'POST', body })
        return url
      } catch (caught) {
        throw toAppError(caught)
      }
    },

    /** Best effort: a file that could not be deleted is only an orphan. */
    async remove(urls: string[]): Promise<void> {
      try {
        await fetcher('/api/admin/media/remove', { method: 'POST', body: { urls } })
      } catch (error) {
        console.warn('[admin] project media: cleanup failed', urls, error)
      }
    },

    /** The URL of a fresh copy of the file, or null when it could not be copied. */
    async copy(url: string, prefix: string): Promise<string | null> {
      try {
        const copy = await fetcher<{ url: string }>('/api/admin/media/copy', { method: 'POST', body: { url, prefix } })
        return copy.url
      } catch (error) {
        console.warn('[admin] project duplicate: media copy failed', url, error)
        return null
      }
    },
  }
}
