import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database } from '#layers/core/shared/types/database.types'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

export function createStorageRepository(client: SupabaseClient) {
  return {
    /**
     * Uploads one file under a unique key and returns its public URL. The key carries a
     * timestamp, so it never overwrites an existing object: replacing an image never
     * touches the file the published page still serves.
     */
    async uploadPublic(bucket: string, path: string, file: File): Promise<string> {
      const { error } = await client.storage.from(bucket).upload(path, file, { contentType: file.type })
      if (error) {
        const failure: AppError = { code: 'unexpected', message: error.message, cause: error }
        throw failure
      }
      return client.storage.from(bucket).getPublicUrl(path).data.publicUrl
    },
  }
}
