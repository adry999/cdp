import type { StageId } from '#layers/core/shared/types/service-stage'
import { serviceTagForParam, stageForServiceParam } from '#layers/core/shared/utils/serviceStage'
import { useContactModal } from '#layers/leads'
import { useQualifierAvailability } from '#layers/qualifier'

/** What a "Discută un proiect" button does on the current page. */
export type ContactCtaKind =
  /** Homepage: scrolls to the contact section. */
  | 'anchor'
  /** The contact page itself: a plain link to it. */
  | 'link'
  /** Anywhere else: opens the qualifier when it is enabled, the contact dialog otherwise. */
  | 'dialog'

export function useContactCta() {
  const route = useRoute()
  const localePath = useLocalePath()
  const getRouteBaseName = useRouteBaseName()
  const nuxtApp = useNuxtApp()
  const { isQualifierEnabled } = useQualifierAvailability()
  const contactModal = useContactModal()

  const baseName = computed(() => {
    const name = getRouteBaseName(route)
    return typeof name === 'string' ? name : undefined
  })

  const kind = computed<ContactCtaKind>(() => {
    if (baseName.value === 'index') return 'anchor'
    if (baseName.value === 'contact') return 'link'
    return 'dialog'
  })

  const to = computed(() => (kind.value === 'anchor' ? `${localePath('index')}#contact` : localePath('contact')))

  // On a service page the service the visitor is reading is the one to pre-select.
  const isServicePage = computed(() => baseName.value === 'servicii-slug')
  const service = computed(() => (isServicePage.value ? serviceTagForParam(route.params.slug) : undefined))
  const stage = computed<StageId | undefined>(() =>
    isServicePage.value ? stageForServiceParam(route.params.slug) : undefined,
  )

  /** Opens the dialog. `returnFocusTo` is where focus goes on close when the trigger is about to disappear. */
  function activate(returnFocusTo?: HTMLElement | null) {
    if (isQualifierEnabled.value) {
      nuxtApp.callHook('qualifier:open', { stage: stage.value })
    } else {
      contactModal.open({ service: service.value, returnFocusTo })
    }
  }

  return { kind, to, activate }
}
