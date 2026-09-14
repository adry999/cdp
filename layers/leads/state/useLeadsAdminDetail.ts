import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { createLeadsAdminRepository } from '#layers/leads/data/leadsAdminRepository'
import type { LeadStatus } from '#layers/leads/domain/lead'

export async function useLeadsAdminDetail(leadId: string) {
  const repository = createLeadsAdminRepository(useSupabaseClient())
  const { data: lead, refresh } = await useAsyncData(`admin-lead-${leadId}`, () => repository.get(leadId))

  const notesState = ref<AsyncStatus>('idle')
  const actionError = ref<AppError | null>(null)

  async function runAction(action: () => Promise<void>): Promise<boolean> {
    actionError.value = null
    try {
      await action()
      return true
    } catch (caught) {
      actionError.value = toAppError(caught)
      return false
    }
  }

  async function updateStatus(status: LeadStatus) {
    if (await runAction(() => repository.updateStatus(leadId, status))) await refresh()
  }

  async function archive() {
    if (await runAction(() => repository.archive(leadId))) await navigateTo('/admin/leads')
  }

  async function saveNotes(notes: string) {
    notesState.value = 'pending'
    try {
      await repository.updateNotes(leadId, notes)
      notesState.value = 'success'
    } catch {
      // The notes line itself shows the failure, next to the field it concerns.
      notesState.value = 'error'
    }
  }

  return { lead, notesState, actionError, updateStatus, saveNotes, archive }
}
