import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'
import type { LeadStatus } from '#layers/leads/domain/lead'

export async function useLeadsAdminDetail(leadId: string) {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: lead, refresh, status: loadStatus, error } = await useAsyncData(`admin-lead-${leadId}`, () =>
    repository.get(leadId),
  )
  // A failed load is not a missing lead: the page shows the error instead of a blank screen.
  const loadError = computed(() => (error.value ? toAppError(error.value) : null))

  const notesState = ref<AsyncStatus>('idle')
  // When the notes last reached the database, so the line under them changes after each save.
  const notesSavedAt = ref<Date | null>(null)
  // Kept apart so each failure shows next to the control that caused it: the status chips, or
  // the archive and delete actions.
  const statusError = ref<AppError | null>(null)
  const actionError = ref<AppError | null>(null)

  async function runAction(action: () => Promise<void>, target = actionError): Promise<boolean> {
    statusError.value = null
    actionError.value = null
    try {
      await action()
      return true
    } catch (caught) {
      target.value = toAppError(caught)
      return false
    }
  }

  async function updateStatus(status: LeadStatus) {
    if (await runAction(() => repository.updateStatus(leadId, status), statusError)) await refresh()
  }

  async function archive() {
    if (await runAction(() => repository.archive(leadId))) await navigateTo('/admin/leads')
  }

  async function unarchive() {
    if (await runAction(() => repository.unarchive(leadId))) await navigateTo('/admin/leads')
  }

  async function remove() {
    if (await runAction(() => repository.remove(leadId))) await navigateTo('/admin/leads')
  }

  async function saveNotes(notes: string) {
    notesState.value = 'pending'
    try {
      await repository.updateNotes(leadId, notes)
      notesSavedAt.value = new Date()
      notesState.value = 'success'
    } catch (caught) {
      // The notes line itself shows the failure, next to the field it concerns.
      console.warn('[leads] saving notes failed', caught)
      notesState.value = 'error'
    }
  }

  return { lead, loadStatus, loadError, notesState, notesSavedAt, statusError, actionError, updateStatus, saveNotes, archive, unarchive, remove }
}
