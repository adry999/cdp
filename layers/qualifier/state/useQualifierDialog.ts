import type { StageId } from '#layers/core/shared/types/service-stage'

// One modal instance is mounted in the default layout; every trigger opens it
// through the qualifier:open event, so its state lives in useState.
export function useQualifierDialog() {
  const isOpen = useState('qualifier:open', () => false)
  const initialStage = useState<StageId | ''>('qualifier:initial-stage', () => '')

  function open(stage: StageId | '') {
    initialStage.value = stage
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialStage.value = ''
  }

  return { isOpen, initialStage, open, close }
}
