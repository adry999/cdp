import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createNewsAdminRepository } from '#layers/news/data/newsAdminRepository'
import {
  applyPreview,
  blockingIssues,
  isHttpUrl,
  toNewsForm,
  toNewsInsert,
  validateNewsForm,
} from '#layers/news/domain/newsForm'

export async function useNewsEditor(idOrSlug: string) {
  const repository = createNewsAdminRepository(useSupabaseClient<Database>())
  const revalidatePublicCache = useRevalidatePublicCache()
  const isNew = idOrSlug === 'nou'

  // The guard must be registered before the first await (see useUnsavedChangesGuard); the form
  // gets the loaded item below.
  const form = ref(toNewsForm(null))
  const { isDirty, markSaved } = useUnsavedChangesGuard(() => form.value)
  // A new item is saved, then reopened under its slug: a new page, so the save result is handed
  // over here instead of being lost with the old one.
  const handover = useState<boolean>('news:editor-saved', () => false)

  const { data: loaded, error: loadError } = await useAsyncData(`admin-news-${idOrSlug}`, async () => (isNew ? null : await repository.get(idOrSlug)))
  // A failed load is not a missing item: only a successful load with no row is a 404.
  if (loadError.value) {
    throw createError({ statusCode: 500, statusMessage: 'News item could not be loaded', cause: loadError.value })
  }
  const original = loaded.value ?? null
  if (!isNew && !original) throw createError({ statusCode: 404, statusMessage: 'News item not found' })

  form.value = toNewsForm(original)
  markSaved()

  const itemId = ref<string | null>(original?.id ?? null)
  // What the database holds; the "Publicat" checkbox is only a wish until the item is saved.
  const storedPublished = ref(!!original?.published_at)
  const saveStatus = ref<AsyncStatus>(handover.value ? 'success' : 'idle')
  handover.value = false
  const saveError = ref<AppError | null>(null)
  // The blocking issues of the last save attempt, listed under the topbar.
  const saveIssues = ref<string[]>([])
  const prefillStatus = ref<AsyncStatus>('idle')
  const prefillError = ref<AppError | null>(null)
  const deleteError = ref<AppError | null>(null)

  const issues = computed(() => validateNewsForm(form.value))
  const warnings = computed(() => issues.value.filter((issue) => issue.severity === 'warning'))
  // After a failed save, the fields still blocking it are marked; each mark goes once its field is fixed.
  const markInvalid = ref(false)
  const invalidFields = computed(() => new Set(markInvalid.value ? blockingIssues(issues.value).map((issue) => issue.field) : []))

  async function save(): Promise<boolean> {
    if (saveStatus.value === 'pending') return false
    saveError.value = null
    saveIssues.value = []
    const blocking = blockingIssues(issues.value)
    if (blocking.length) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: 'Corectează câmpurile de mai jos.' }
      saveIssues.value = blocking.map((issue) => issue.message)
      markInvalid.value = true
      return false
    }

    saveStatus.value = 'pending'
    try {
      const row = toNewsInsert(form.value, new Date())
      const saved = itemId.value ? await repository.update(itemId.value, row) : await repository.create(row)
      itemId.value = saved.id
      form.value.slugRo = saved.slug_ro
      form.value.publishedAt = row.published_at
      storedPublished.value = !!row.published_at
      saveStatus.value = 'success'
      markInvalid.value = false
      markSaved()
      await revalidatePublicCache()
      if (isNew || saved.slug_ro !== idOrSlug) {
        handover.value = true
        await navigateTo(`/admin/news/${saved.slug_ro}`)
      }
      return true
    } catch (caught) {
      saveStatus.value = 'error'
      saveError.value = toAppError(caught)
      return false
    }
  }

  async function prefillFromLink() {
    prefillError.value = null
    const url = form.value.sourceUrl.trim()
    if (!isHttpUrl(url)) {
      prefillStatus.value = 'error'
      prefillError.value = { code: 'validation', message: 'Introdu un link care începe cu http:// sau https://.' }
      return
    }
    prefillStatus.value = 'pending'
    try {
      const preview = await repository.previewSource(url)
      // Filled into the existing form object, read after the request: the unsaved-changes guard
      // watches that object, and whatever the admin typed meanwhile is kept.
      Object.assign(form.value, applyPreview(form.value, preview))
      prefillStatus.value = 'success'
    } catch (caught) {
      prefillStatus.value = 'error'
      prefillError.value = toAppError(caught)
    }
  }

  async function remove() {
    deleteError.value = null
    if (!itemId.value) return
    try {
      await repository.remove(itemId.value)
    } catch (caught) {
      deleteError.value = toAppError(caught)
      return
    }
    markSaved()
    await revalidatePublicCache()
    await navigateTo('/admin/news')
  }

  return {
    form,
    isNew,
    isDirty,
    storedPublished,
    issues,
    warnings,
    invalidFields,
    saveStatus,
    saveError,
    saveIssues,
    prefillStatus,
    prefillError,
    deleteError,
    save,
    prefillFromLink,
    remove,
  }
}
