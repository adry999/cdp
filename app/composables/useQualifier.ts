import { isStageId, type StageId } from '~~/shared/utils/qualifierRouting'

/**
 * Shared open/close state for the single QualifierModal instance mounted in
 * the default layout. Both the hero CTA and the contact section trigger the
 * same modal, so the state has to live outside either component.
 *
 * The modal is only mounted when `NUXT_PUBLIC_QUALIFIER_ENABLED` is `true`
 * (see nuxt.config.ts / app/layouts/default.vue). `enabled` is exposed here so
 * the trigger components can decide between opening the modal and their
 * pre-existing fallback (an anchor link / the inline ContactForm).
 *
 * `initialStage` lets a caller pre-select a step-1 stage — the growth timeline
 * in HomeServices.vue passes the stage whose "Start at this stage" button was
 * clicked. It is consumed once when the modal opens and cleared on close.
 */
export function useQualifier() {
  const isOpen = useState('qualifier:open', () => false)
  const initialStage = useState<StageId | ''>('qualifier:initial-stage', () => '')
  const enabled = computed(() => useRuntimeConfig().public.qualifierEnabled === true)

  // `stage` is typed loosely because some callers wire this straight to a click
  // handler (`@click="open"`), which would otherwise pass a MouseEvent.
  function open(stage?: StageId | unknown) {
    if (!enabled.value) return
    initialStage.value = isStageId(stage) ? stage : ''
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    initialStage.value = ''
  }

  return { isOpen, initialStage, enabled, open, close }
}
