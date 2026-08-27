/**
 * Shared open/close state for the single QualifierModal instance mounted in
 * the default layout. Both the hero CTA and the contact section trigger the
 * same modal, so the state has to live outside either component.
 *
 * The modal is only mounted when `NUXT_PUBLIC_QUALIFIER_ENABLED` is `true`
 * (see nuxt.config.ts / app/layouts/default.vue). `enabled` is exposed here so
 * the trigger components can decide between opening the modal and their
 * pre-existing fallback (an anchor link / the inline ContactForm).
 */
export function useQualifier() {
  const isOpen = useState('qualifier:open', () => false)
  const enabled = computed(() => useRuntimeConfig().public.qualifierEnabled === true)

  function open() {
    if (enabled.value) isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, enabled, open, close }
}
