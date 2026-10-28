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

  const { data: loaded, error: loadError } = await useAsyncData(`admin-project-${slug}`, async () =>
    isNew ? null : await repository.getBySlug(slug),
  )
  // A load failure or an unknown slug must not open an empty "new project" form: saving it
  // would create a project the admin never meant to.
  if (loadError.value) {
    throw createError({ statusCode: 500, statusMessage: 'Project could not be loaded', cause: loadError.value })
  }
  if (!isNew && !loaded.value) throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  // A failed preview load must not block editing: the panel just renders empty groups.
  const { data: previewRows } = await useAsyncData(`admin-project-menu-preview-${slug}`, () =>
    repository.listForMenuPreview().catch((caught: unknown) => {
      console.warn('[admin] menu preview: load failed', caught)
      return []
    }),
  )
  const original = loaded.value ?? null

  const projectId = ref<string | null>(original?.id ?? null)
  const form = ref(toProjectForm(original))
  const saveStatus = ref<AsyncStatus>('idle')
  const saveError = ref<AppError | null>(null)
  // Set by the images section while any upload is in flight; saving then would store the old path.
  const uploading = ref(false)
  // Media the last saved state referenced, so each save cleans up exactly what it replaced.
  let savedMedia = rowMediaUrls(original)

  // What the database holds: a slug edit on a project that was already published creates redirects.
  const savedSlugs = ref({
    slugRo: form.value.slugRo,
    slugEn: form.value.slugEn,
    wasPublished: Boolean(original?.published_at),
  })

  const { markSaved } = useUnsavedChangesGuard(form.value)

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

    if (uploading.value) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: 'Așteaptă să se termine încărcarea imaginii.' }
      return false
    }

    const issues = validateProjectPayload({ id: projectId.value, ...form.value })
    if (issues.length) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: issues.map((issue) => issue.message).join(' ') }
      return false
    }

    saveStatus.value = 'pending'
    try {
      const saved = await repository.save(toSavePayload(form.value, projectId.value))
      projectId.value = saved.id
      saveStatus.value = 'success'
      markSaved()
      savedSlugs.value = {
        slugRo: form.value.slugRo,
        slugEn: form.value.slugEn,
        wasPublished: form.value.published,
      }

      await revalidatePublicCache()
      // Only after the save succeeds: the published page may serve the old files until then.
      const replaced = replacedMediaUrls(savedMedia, form.value)
      savedMedia = formMediaUrls(form.value)
      await repository.removeUnreferencedMedia(replaced)

      if (isNew || form.value.slugRo.trim() !== slug) await navigateTo(`/admin/projects/${saved.slug_ro}`)
      return true
    } catch (caught) {
      saveStatus.value = 'error'
      saveError.value = toAppError(caught)
      return false
    }
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
    if (await save()) {
      publishing.value = false
    } else {
      // Nothing was written, so the form keeps saying what the database says.
      form.value.published = false
    }
  }

  async function unpublish() {
    if (saveStatus.value === 'pending') return
    form.value.published = false
    if (!(await save())) form.value.published = true
  }

  return {
    form,
    isNew,
    menuPreview,
    savedSlugs,
    saveStatus,
    saveError,
    uploading,
    publishing,
    consentConfirmed,
    checklist,
    save,
    askPublish,
    cancelPublish,
    confirmPublish,
    unpublish,
  }
}
