import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createProjectsAdminRepository } from '#layers/projects/data/projectsAdminRepository'
import { buildMenuPreview } from '#layers/projects/domain/menuPreview'
import { replacedMediaUrls, toProjectForm, toSavePayload } from '#layers/projects/domain/projectForm'
import { validateProjectPayload } from '#layers/projects/domain/projectPayload'
import { useRevalidatePublicCache } from '#layers/projects/state/useRevalidatePublicCache'

export async function useProjectsEditor(slug: string) {
  const repository = createProjectsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const isNew = slug === 'nou'

  const { data: loaded } = await useAsyncData(`admin-project-${slug}`, async () =>
    isNew ? null : await repository.getBySlug(slug),
  )
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

  async function save() {
    saveError.value = null

    const issues = validateProjectPayload({ id: projectId.value, ...form.value })
    if (issues.length) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: issues.map((issue) => issue.message).join(' ') }
      return
    }

    saveStatus.value = 'pending'
    try {
      const saved = await repository.save(toSavePayload(form.value, projectId.value))
      projectId.value = saved.id
      saveStatus.value = 'success'
      markSaved()

      await revalidatePublicCache()
      // Only after the save succeeds: the published page may serve the old files until then.
      await repository.removeUnreferencedMedia(replacedMediaUrls(original, form.value))

      if (isNew || form.value.slugRo.trim() !== slug) await navigateTo(`/admin/projects/${saved.slug_ro}`)
    } catch (caught) {
      saveStatus.value = 'error'
      saveError.value = toAppError(caught)
    }
  }

  return { form, isNew, menuPreview, saveStatus, saveError, save }
}
