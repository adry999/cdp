import { ref } from 'vue'
import type { AppError } from '#layers/core/shared/types/app-error'
import type { AsyncStatus } from '#layers/core/shared/types/async'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { postLead } from '#layers/leads/data/leadsRepository'
import {
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactSubmission,
} from '#layers/leads/domain/lead'

export interface LeadSubmissionDependencies {
  post: (submission: ContactSubmission, turnstileToken?: string) => Promise<unknown>
}

export function useLeadSubmission(deps: LeadSubmissionDependencies = { post: postLead }) {
  const status = ref<AsyncStatus>('idle')
  const fieldErrors = ref<ContactFieldErrors>({})
  const error = ref<AppError | null>(null)
  // Set by the first submit: from then on the field errors follow the values as the visitor types.
  const tried = ref(false)

  async function submit(submission: ContactSubmission, turnstileToken?: string): Promise<boolean> {
    tried.value = true
    fieldErrors.value = validateContactSubmission(submission)
    if (Object.keys(fieldErrors.value).length > 0 || status.value === 'pending') return false

    status.value = 'pending'
    error.value = null
    try {
      await deps.post(submission, turnstileToken)
      status.value = 'success'
      return true
    } catch (caught) {
      error.value = toAppError(caught)
      status.value = 'error'
      return false
    }
  }

  // Called on every edit; before the first submit it stays silent, so nothing is flagged mid-typing.
  function revalidate(submission: ContactSubmission) {
    if (tried.value) fieldErrors.value = validateContactSubmission(submission)
  }

  return { status, fieldErrors, error, submit, revalidate }
}
