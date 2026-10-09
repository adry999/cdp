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
  const isNew = idOrSlug === 'nou'

  const { data: loaded } = await useAsyncData(`admin-news-${idOrSlug}`, async () => (isNew ? null : await repository.get(idOrSlug)))
  const original = loaded.value ?? null
  if (!isNew && !original) throw createError({ statusCode: 404, statusMessage: 'News item not found' })

  const itemId = ref<string | null>(original?.id ?? null)
  const form = ref(toNewsForm(original))
  const saveStatus = ref<AsyncStatus>('idle')
  const saveError = ref<AppError | null>(null)
  const prefillStatus = ref<AsyncStatus>('idle')
  const prefillError = ref<AppError | null>(null)
  const deleteError = ref<AppError | null>(null)

  const { markSaved } = useUnsavedChangesGuard(form.value)

  const issues = computed(() => validateNewsForm(form.value))
  const warnings = computed(() => issues.value.filter((issue) => issue.severity === 'warning'))

  async function save() {
    saveError.value = null
    const blocking = blockingIssues(issues.value)
    if (blocking.length) {
      saveStatus.value = 'error'
      saveError.value = { code: 'validation', message: blocking.map((issue) => issue.message).join(' ') }
      return
    }

    saveStatus.value = 'pending'
    try {
      const row = toNewsInsert(form.value, new Date())
      const saved = itemId.value ? await repository.update(itemId.value, row) : await repository.create(row)
      itemId.value = saved.id
      form.value.slugRo = saved.slug_ro
      form.value.publishedAt = row.published_at
      saveStatus.value = 'success'
      markSaved()
      if (isNew || saved.slug_ro !== idOrSlug) await navigateTo(`/admin/news/${saved.slug_ro}`)
    } catch (caught) {
      saveStatus.value = 'error'
      saveError.value = toAppError(caught)
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
      form.value = applyPreview(form.value, await repository.previewSource(url))
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
    await navigateTo('/admin/news')
  }

  return { form, isNew, issues, warnings, saveStatus, saveError, prefillStatus, prefillError, deleteError, save, prefillFromLink, remove }
}
