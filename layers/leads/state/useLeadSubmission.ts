import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postLead } from '#layers/leads/data/leadsRepository'
import {
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
} from '#layers/leads/domain/lead'

export function useLeadSubmission() {
  const status = ref<AsyncStatus>('idle')
  const fieldErrors = ref<ContactFieldErrors>({})
  const error = ref<AppError | null>(null)

  async function submit(submission: ContactSubmission): Promise<boolean> {
    fieldErrors.value = validateContactSubmission(submission)
    if (Object.keys(fieldErrors.value).length > 0 || status.value === 'pending') return false

    status.value = 'pending'
    error.value = null
    try {
      await postLead(submission)
      status.value = 'success'
      return true
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
      return false
    }
  }

  return { status, fieldErrors, error, submit }
}
