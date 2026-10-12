import type { AppError } from '#layers/core/shared/types/app-error'
import type { Database, Json } from '#layers/core/shared/types/database.types'
import {
  ADMIN_PROJECT_LIST_SELECT,
  ADMIN_PROJECT_SELECT,
  MENU_PREVIEW_SELECT,
  type MenuPreviewRow,
  type AdminProjectListRow,
  type AdminProjectRow,
} from '#layers/projects/domain/projectSelect'
import { nextCopySlug } from '#layers/projects/domain/adminProjectList'
import { MEDIA_BUCKET, storageKeyFromPublicUrl } from '#layers/projects/domain/storagePath'

type SupabaseClient = ReturnType<typeof useSupabaseClient<Database>>

export interface SavedProject {
  id: string
  slug_ro: string
  slug_en: string
}

function failure(message: string, cause: unknown): AppError {
  return { code: 'unexpected', message, cause }
}

function toSavedProject(data: Json): SavedProject | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
  const { id, slug_ro, slug_en } = data
  if (typeof id !== 'string' || typeof slug_ro !== 'string' || typeof slug_en !== 'string') return null
  return { id, slug_ro, slug_en }
}

// The row's own id is dropped so the database assigns a fresh one to the copy.
function copyChildren<T extends { id: string }>(children: T[], projectId: string) {
  return children.map(({ id: _id, ...rest }) => ({ ...rest, project_id: projectId }))
}

export function createProjectsAdminRepository(client: SupabaseClient) {
  async function isMediaReferenced(url: string): Promise<boolean | null> {
    const [projectRefs, imageRefs] = await Promise.all([
      client.from('projects').select('id', { count: 'exact', head: true }).or(`cover_path.eq.${url},hero_path.eq.${url}`),
      client.from('project_images').select('id', { count: 'exact', head: true }).eq('path', url),
    ])
    if (projectRefs.error || imageRefs.error) {
      console.warn('[admin] project media: reference check failed, file kept', url, projectRefs.error ?? imageRefs.error)
      return null
    }
    return (projectRefs.count ?? 0) > 0 || (imageRefs.count ?? 0) > 0
  }

  // A URL another row still references belongs to another project and is kept: older
  // duplicates can share Storage keys with the project being edited or deleted.
  async function removeUnreferencedMedia(urls: string[]) {
    const keys: string[] = []
    for (const url of urls) {
      const key = storageKeyFromPublicUrl(url, MEDIA_BUCKET)
      if (!key) continue
      if ((await isMediaReferenced(url)) === false) keys.push(key)
    }
    if (!keys.length) return

    const removal = await client.storage
      .from(MEDIA_BUCKET)
      .remove(keys)
      .catch((thrown: unknown) => ({ data: null, error: thrown }))
    if (removal.error) console.warn('[admin] project media: cleanup failed', keys, removal.error)
  }

  // Copies the underlying Storage object rather than reusing its URL, so each URL belongs to
  // exactly one project — the invariant that delete cleanup and replace cleanup rely on.
  // `copied` is false when there was a file to copy but the copy failed.
  async function copyMedia(url: string | null, newPrefix: string): Promise<{ url: string | null; copied: boolean }> {
    if (!url) return { url: null, copied: true }
    const oldKey = storageKeyFromPublicUrl(url, MEDIA_BUCKET)
    if (!oldKey) return { url: null, copied: true }
    const ext = oldKey.split('.').pop() || 'jpg'
    const newKey = `${newPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await client.storage.from(MEDIA_BUCKET).copy(oldKey, newKey)
    if (error) {
      console.warn('[admin] project duplicate: media copy failed', oldKey, error)
      return { url: null, copied: false }
    }
    return { url: client.storage.from(MEDIA_BUCKET).getPublicUrl(newKey).data.publicUrl, copied: true }
  }

  async function freeCopySlug(slug: string): Promise<string> {
    const { data, error } = await client.from('projects').select('slug_ro, slug_en')
    if (error) throw failure('Proiectul nu a putut fi duplicat.', error)
    const taken = new Set(data.flatMap((row) => [row.slug_ro, row.slug_en].filter((value): value is string => !!value)))
    return nextCopySlug(slug, taken)
  }

  return {
    removeUnreferencedMedia,

    async list(): Promise<AdminProjectListRow[]> {
      const { data, error } = await client.from('projects').select(ADMIN_PROJECT_LIST_SELECT).order('sort_order')
      if (error) throw failure('Proiectele nu au putut fi încărcate.', error)
      return data
    },

    async listForMenuPreview(): Promise<MenuPreviewRow[]> {
      const { data, error } = await client.from('projects').select(MENU_PREVIEW_SELECT)
      if (error) throw failure('Previzualizarea meniului nu a putut fi încărcată.', error)
      return data
    },

    async getBySlug(slug: string): Promise<AdminProjectRow | null> {
      const { data, error } = await client.from('projects').select(ADMIN_PROJECT_SELECT).eq('slug_ro', slug).maybeSingle()
      if (error) throw failure('Proiectul nu a putut fi încărcat.', error)
      return data
    },

    // Single RPC, single transaction: either the whole project saves — project row, facts,
    // stack, stats, gallery, redirect on slug change — or none of it does. See
    // supabase/migrations/20260826120200_save_project_rpc.sql.
    async save(payload: { [key: string]: Json }): Promise<SavedProject> {
      const { data, error } = await client.rpc('save_project', { payload })
      if (error) throw failure(error.message, error)
      const saved = toSavedProject(data)
      if (!saved) throw failure('Răspuns neașteptat la salvarea proiectului.', data)
      return saved
    },

    // sort_order is a global ordering, so the caller passes the full, unfiltered list. One RPC,
    // one transaction: see supabase/migrations/20261012090000_reorder_projects_rpc.sql.
    async reorder(slugs: string[]) {
      const { error } = await client.rpc('reorder_projects', { slugs })
      if (error) throw failure('Ordinea nu s-a salvat.', error)
    },

    async setFeatured(slug: string, featured: boolean) {
      const { data, error } = await client.from('projects').update({ featured }).eq('slug_ro', slug).select('slug_ro')
      if (error) throw failure('Nu s-a putut schimba afișarea pe homepage.', error)
      // RLS or a deleted row turns the update into zero rows rather than an error.
      if (!data.length) throw failure('Nu s-a putut schimba afișarea pe homepage.', null)
    },

    // Publishing sets published_at to now; unpublishing clears it and, like save_project(),
    // drops the redirects that would otherwise chain into a 404.
    async setPublished(project: { slug_ro: string; slug_en: string | null }, published: boolean) {
      const failureMessage = published ? 'Proiectul nu a putut fi publicat.' : 'Proiectul nu a putut fi retras.'
      const { data, error } = await client
        .from('projects')
        .update({ published_at: published ? new Date().toISOString() : null })
        .eq('slug_ro', project.slug_ro)
        .select('slug_ro')
      if (error) throw failure(failureMessage, error)
      if (!data.length) throw failure(failureMessage, null)
      if (published) return
      const { error: redirectsError } = await client
        .from('redirects')
        .delete()
        .or(`to_path.eq./proiecte/${project.slug_ro},to_path.eq./en/work/${project.slug_en ?? project.slug_ro}`)
      if (redirectsError) throw failure('Proiectul a fost retras, dar redirect-urile nu au putut fi șterse.', redirectsError)
    },

    async remove(slug: string) {
      // The image paths (and slugs, for redirect cleanup below) are read before the row — and
      // its project_images rows, cascade-deleted with it — is gone, or there is nothing left
      // to clean up from.
      const { data: project, error: readError } = await client
        .from('projects')
        .select('slug_ro, slug_en, cover_path, hero_path, project_images(path)')
        .eq('slug_ro', slug)
        .maybeSingle()
      // Without that read the delete would leave orphaned files and a stale redirect behind
      // with nothing to log, so it is refused and the admin retries.
      if (readError) throw failure('Proiectul nu a putut fi șters.', readError)
      if (!project) return

      const { error } = await client.from('projects').delete().eq('slug_ro', slug)
      if (error) throw failure('Proiectul nu a putut fi șters.', error)

      // save_project() cleans redirects on unpublish, but delete never goes through that RPC
      // and would otherwise leave a 301 chaining into a 404.
      const { error: redirectsError } = await client
        .from('redirects')
        .delete()
        .or(`to_path.eq./proiecte/${project.slug_ro},to_path.eq./en/work/${project.slug_en ?? project.slug_ro}`)
      if (redirectsError) throw failure('Proiectul a fost șters, dar redirect-urile nu au putut fi șterse.', redirectsError)

      await removeUnreferencedMedia(
        [project.cover_path, project.hero_path, ...project.project_images.map((image) => image.path)].filter(
          (url): url is string => !!url,
        ),
      )
    },

    /**
     * Resolves to `false` when the project row was copied but something else was not: a media
     * file, a child table that could not be read, or child rows that could not be inserted.
     */
    async duplicate(slug: string): Promise<boolean> {
      const { data: project, error: loadError } = await client.from('projects').select('*').eq('slug_ro', slug).single()
      if (loadError) throw failure('Proiectul nu a putut fi încărcat.', loadError)

      const newSlug = await freeCopySlug(slug)
      const { id, created_at, updated_at, cover_path, hero_path, ...rest } = project
      const [newCover, newHero] = await Promise.all([
        copyMedia(cover_path, `${newSlug}/cover`),
        copyMedia(hero_path, `${newSlug}/hero`),
      ])
      let complete = newCover.copied && newHero.copied

      const { data: created, error } = await client
        .from('projects')
        .insert({
          ...rest,
          cover_path: newCover.url,
          hero_path: newHero.url,
          slug_ro: newSlug,
          slug_en: newSlug,
          card_title_ro: `${project.card_title_ro} (copie)`,
          published_at: null,
        })
        .select('id')
        .single()
      if (error) throw failure('Proiectul nu a putut fi duplicat.', error)

      const children = await Promise.all([
        client.from('project_facts').select('*').eq('project_id', id),
        client.from('project_steps').select('*').eq('project_id', id),
        client.from('project_stack').select('*').eq('project_id', id),
        client.from('project_stats').select('*').eq('project_id', id),
        client.from('project_images').select('*').eq('project_id', id),
      ])
      const [facts, steps, stack, stats, images] = children
      for (const result of children) {
        if (result.error) {
          console.warn('[admin] project duplicate: child rows could not be read', slug, result.error)
          complete = false
        }
      }

      const galleryCopies = await Promise.all(
        copyChildren(images.data ?? [], created.id).map(async (image) => {
          const copy = await copyMedia(image.path, `${newSlug}/gallery`)
          if (!copy.copied) complete = false
          // A failed copy keeps the original URL so the slot is not lost; the file is then
          // shared with the source project and reference counting keeps it on delete.
          return { ...image, path: copy.url ?? image.path }
        }),
      )

      const inserts = await Promise.all([
        facts.data?.length ? client.from('project_facts').insert(copyChildren(facts.data, created.id)) : null,
        steps.data?.length ? client.from('project_steps').insert(copyChildren(steps.data, created.id)) : null,
        stack.data?.length ? client.from('project_stack').insert(copyChildren(stack.data, created.id)) : null,
        stats.data?.length ? client.from('project_stats').insert(copyChildren(stats.data, created.id)) : null,
        galleryCopies.length ? client.from('project_images').insert(galleryCopies) : null,
      ])
      for (const result of inserts) {
        if (result?.error) {
          console.warn('[admin] project duplicate: child rows could not be copied', slug, result.error)
          complete = false
        }
      }
      return complete
    },
  }
}
