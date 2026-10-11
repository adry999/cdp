import type { ServiceTagId } from '#layers/core/shared/types/service-tag'

export interface ContactModalRequest {
  /** Service chip to pre-select (the service of the page the visitor is on). */
  service?: ServiceTagId
  /** Where focus goes on close; defaults to the element focused when the dialog opens. */
  returnFocusTo?: HTMLElement | null
}

// One dialog is mounted in the default layout; every trigger opens it through this state.
export function useContactModal() {
  const isOpen = useState('leads:contact-modal', () => false)
  const service = useState<ServiceTagId | undefined>('leads:contact-modal-service', () => undefined)
  const returnFocusTo = useState<HTMLElement | null>('leads:contact-modal-return', () => null)

  function open(request: ContactModalRequest = {}) {
    service.value = request.service
    returnFocusTo.value = request.returnFocusTo ?? (import.meta.client ? (document.activeElement as HTMLElement | null) : null)
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, service, returnFocusTo, open, close }
}
