import { isStageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier/state/useQualifierAvailability'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

export default defineNuxtPlugin((nuxtApp) => {
  // Resolved here, in plugin context: the hook callback runs later, outside it.
  const dialog = useQualifierDialog()
  const { isQualifierEnabled } = useQualifierAvailability()

  nuxtApp.hook('qualifier:open', (request) => {
    if (!isQualifierEnabled.value) return
    // The payload comes from other layers; the hook bus does not enforce types at runtime.
    dialog.open(isStageId(request.stage) ? request.stage : '')
  })
})
