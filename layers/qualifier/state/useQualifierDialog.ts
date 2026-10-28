import type { StageId } from '#layers/core/shared/types/service-stage'

// One modal instance is mounted in the default layout; every trigger opens it
// through the qualifier:open event, so its state lives in useState.
export function useQualifierDialog() {
  const isOpen = useState('qualifier:open', () => false)
  const initialStage = useState<StageId | ''>('qualifier:initial-stage', () => '')

  // Where focus goes on close when the trigger is about to disappear (the mobile menu's button).
  const returnFocusTo = useState<HTMLElement | null>('qualifier:return-focus', () => null)

  function open(stage: StageId | '', trigger?: HTMLElement | null) {
    initialStage.value = stage
    returnFocusTo.value =
      trigger ?? (import.meta.client && document.activeElement instanceof HTMLElement ? document.activeElement : null)
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialStage.value = ''
  }

  return { isOpen, initialStage, returnFocusTo, open, close }
}
