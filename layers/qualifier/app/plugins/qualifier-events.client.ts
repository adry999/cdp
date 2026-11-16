import { isServiceTagId, SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'
import { isStageId } from '#layers/core/shared/types/service-stage'
import { serviceTagForStage } from '#layers/core/shared/utils/serviceStage'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { useContactModal } from '#layers/leads'
import { useQualifierAvailability } from '#layers/qualifier/state/useQualifierAvailability'
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

export default defineNuxtPlugin((nuxtApp) => {
  // Resolved here, in plugin context: the hook callback runs later, outside it.
  const dialog = useQualifierDialog()
  const contactModal = useContactModal()
  const { isQualifierEnabled } = useQualifierAvailability()
  const offeredServices = visibleServices(SERVICE_TAG_IDS, useRuntimeConfig().public.grantsEnabled === true)

  nuxtApp.hook('qualifier:open', (request) => {
    if (!isQualifierEnabled.value) return
    // The payload comes from other layers; the hook bus does not enforce types at runtime.
    dialog.open(
      isStageId(request.stage) ? request.stage : '',
      request.returnFocusTo instanceof HTMLElement ? request.returnFocusTo : null,
    )
  })

  // An in-page contact button: the qualifier on its stage when the qualifier is on, otherwise the
  // contact dialog with the page's service, or the stage's service when only one offered service has it.
  nuxtApp.hook('contact:open', (request) => {
    const stage = isStageId(request.stage) ? request.stage : undefined
    const returnFocusTo = request.returnFocusTo instanceof HTMLElement ? request.returnFocusTo : null
    if (isQualifierEnabled.value) {
      dialog.open(stage ?? '', returnFocusTo)
      return
    }
    const service = isServiceTagId(request.service)
      ? request.service
      : stage
        ? serviceTagForStage(stage, offeredServices)
        : undefined
    contactModal.open({ service, returnFocusTo })
  })
})
