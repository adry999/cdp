import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createProjectsAdminRepository } from '#layers/projects/data/projectsAdminRepository'
import { evaluateChecklist } from '#layers/projects/domain/adminProjectList'
import { buildMenuPreview } from '#layers/projects/domain/menuPreview'
import {
  checklistInputFromForm,
  formMediaUrls,
  replacedMediaUrls,
  rowMediaUrls,
  toProjectForm,
  toSavePayload,
} from '#layers/projects/domain/projectForm'
import { validateProjectPayload } from '#layers/projects/domain/projectPayload'

export async function useProjectsEditor(slug: string) {
  const repository = createProjectsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const isNew = slug === 'nou'

  // Everything that needs the component or the Nuxt context runs before the first await: the
  // guard registers a route guard (see useUnsavedChangesGuard), and both loads start together
  // because a second useAsyncData after an await has no Nuxt context on the server.
  const form = ref(toProjectForm(null))
  const { isDirty, markSaved } = useUnsavedChangesGuard(() => form.value)
  // A new project is saved, then reopened under its slug: a new page, so the save result is
  // handed over here instead of being lost with the old one.
  const handover = useState<{ cacheCleared: boolean } | null>('projects:editor-saved', () => null)

  const [{ data: loaded, error: loadError }, { data: previewRows }] = await Promise.all([
    useAsyncData(`admin-project-${slug}`, async () => (isNew ? null : await repository.getBySlug(slug))),
    // A failed preview load must not block editing: the panel just renders empty groups.
    useAsyncData(`admin-project-menu-preview-${slug}`, () =>
      repository.listForMenuPreview().catch((caught: unknown) => {
        console.warn('[admin] menu preview: load failed', caught)
        return []
      }),
    ),
  ])
  // A load failure or an unknown slug must not open an empty "new project" form: saving it
  // would create a project the admin never meant to.
  if (loadError.value) {
    throw createError({ statusCode: 500, statusMessage: 'Project could not be loaded', cause: loadError.value })
  }
  if (!isNew && !loaded.value) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const original = loaded.value ?? null

  form.value = toProjectForm(original)
  markSaved()

  const projectId = ref<string | null>(original?.id ?? null)
  const saveStatus = ref<AsyncStatus>(handover.value ? 'success' : 'idle')
  const saveError = ref<AppError | null>(null)
  // Every validation problem of the last save attempt, listed under the topbar.
  const saveIssues = ref<string[]>([])
  // After a failed save, the fields still failing validation are marked; each mark goes as soon
  // as its field is fixed.
  const markInvalid = ref(false)
  const invalidFields = computed(
    () => new Set(markInvalid.value ? validateProjectPayload({ id: projectId.value, ...form.value }).map((issue) => issue.field) : []),
  )
  // False when the last save could not clear the public cache here or on the other domain.
  const cacheCleared = ref(handover.value?.cacheCleared ?? true)
  handover.value = null
  // Set by the images section while any upload is in flight; saving then would store the old path.
  const uploading = ref(false)
  // Media the last saved state referenced, so each save cleans up exactly what it replaced.
  let savedMedia = rowMediaUrls(original)

  // What the database holds: a slug edit on a project that was already published creates redirects.
  const savedSlugs = ref({
    slugRo: form.value.slugRo.trim(),
    slugEn: form.value.slugEn.trim(),
    wasPublished: Boolean(original?.published_at),
  })

  const menuPreview = computed(() =>
    buildMenuPreview(previewRows.value ?? [], {
      slug: isNew ? null : slug,
      title: form.value.cardTitle.ro,
      coverPath: form.value.coverPath,
      featured: form.value.featured,
      navServices: form.value.navServices,
      published: form.value.published,
    }),
  )

  // Publishing from the editor goes through the same checklist as the list: the client's
  // consent is confirmed by hand and the demo-screens warning is shown before anything goes live.
  const publishing = ref(false)
  const consentConfirmed = ref(false)
  const checklist = computed(() => evaluateChecklist(checklistInputFromForm(form.value), consentConfirmed.value))

  async function save(): Promise<boolean> {
    if (saveStatus.value === 'pending') return false
    saveError.value = null
    saveIssues.value = []

    if (uploading.value) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: 'Așteaptă să se termine încărcarea imaginii.' }
      return false
    }

    const issues = validateProjectPayload({ id: projectId.value, ...form.value })
    if (issues.length) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: 'Corectează câmpurile de mai jos.' }
      saveIssues.value = issues.map((issue) => issue.message)
      markInvalid.value = true
      return false
    }

    saveStatus.value = 'pending'
    try {
      const saved = await repository.save(toSavePayload(form.value, projectId.value))
      projectId.value = saved.id
      saveStatus.value = 'success'
      markInvalid.value = false
      markSaved()
      savedSlugs.value = {
        slugRo: form.value.slugRo.trim(),
        slugEn: form.value.slugEn.trim(),
        wasPublished: form.value.published,
      }

      cacheCleared.value = await revalidatePublicCache()
      // Only after the save succeeds: the published page may serve the old files until then.
      const replaced = replacedMediaUrls(savedMedia, form.value)
      savedMedia = formMediaUrls(form.value)
      await repository.removeUnreferencedMedia(replaced)

      if (isNew || form.value.slugRo.trim() !== slug) {
        handover.value = { cacheCleared: cacheCleared.value }
        await navigateTo(`/admin/projects/${saved.slug_ro}`)
      }
      return true
    } catch (caught) {
      saveStatus.value = 'error'
      saveError.value = toAppError(caught)
      return false
    }
  }

  async function retryRevalidate() {
    cacheCleared.value = await revalidatePublicCache()
  }

  function askPublish() {
    consentConfirmed.value = false
    publishing.value = true
  }

  function cancelPublish() {
    publishing.value = false
  }

  async function confirmPublish() {
    if (!checklist.value.canPublish || saveStatus.value === 'pending') return
    form.value.published = true
    const saved = await save()
    // Closed either way: the save error shows under the topbar, which the dialog scrim would hide.
    publishing.value = false
    // Nothing was written on failure, so the form keeps saying what the database says.
    if (!saved) form.value.published = false
  }

  // Unpublishing saves the whole form and deletes the old slugs' redirects, so it is confirmed
  // first. `withEdits` is read when the dialog opens, so the dialog can say edits go along.
  const unpublishing = ref<{ withEdits: boolean } | null>(null)

  function askUnpublish() {
    unpublishing.value = { withEdits: isDirty.value }
  }

  function cancelUnpublish() {
    unpublishing.value = null
  }

  async function confirmUnpublish() {
    if (saveStatus.value === 'pending') return
    form.value.published = false
    const saved = await save()
    // Closed either way, like publishing: a failure shows under the topbar.
    unpublishing.value = null
    if (!saved) form.value.published = true
  }

  return {
    form,
    isNew,
    isDirty,
    menuPreview,
    savedSlugs,
    saveStatus,
    saveError,
    saveIssues,
    invalidFields,
    cacheCleared,
    uploading,
    publishing,
    consentConfirmed,
    unpublishing,
    checklist,
    save,
    retryRevalidate,
    askPublish,
    cancelPublish,
    confirmPublish,
    askUnpublish,
    cancelUnpublish,
    confirmUnpublish,
  }
}
