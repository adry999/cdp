import type { StageId } from '#layers/core/shared/types/service-stage'

export interface ContactModalRequest {
  /** Stage chip to pre-select (the service of the page the visitor is on). */
  stage?: StageId
  /** Where focus goes on close; defaults to the element focused when the dialog opens. */
  returnFocusTo?: HTMLElement | null
}

// One dialog is mounted in the default layout; every trigger opens it through this state.
export function useContactModal() {
  const isOpen = useState('leads:contact-modal', () => false)
  const stage = useState<StageId | undefined>('leads:contact-modal-stage', () => undefined)
  const returnFocusTo = useState<HTMLElement | null>('leads:contact-modal-return', () => null)

  function open(request: ContactModalRequest = {}) {
    stage.value = request.stage
    returnFocusTo.value = request.returnFocusTo ?? (import.meta.client ? (document.activeElement as HTMLElement | null) : null)
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, stage, returnFocusTo, open, close }
}
