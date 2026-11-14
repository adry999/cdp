import type { ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { StageId } from '#layers/core/shared/types/service-stage'

export interface ContactTriggerRequest {
  /** The stage the button stands for (opens the qualifier on it when the qualifier is on). */
  stage?: StageId
  /** The service to pre-select in the contact dialog (the service of the page). */
  service?: ServiceTagId
}

/**
 * An in-page contact link ("Începe un proiect", a pricing stage, "Hai să discutăm"). Its `href` is a
 * real page for a visit without JavaScript or a new tab: the homepage contact section on the
 * homepage, `/contact` everywhere else. `open` turns a plain click into a `contact:open` request, so
 * the visitor stays on the page and the dialog opens in place (layers/qualifier listens). On the
 * homepage and on `/contact` the click stays a link: the form is already on the page.
 *
 * Bind `open` with `@click.capture` on a `NuxtLink` (or an `AppButton` with `href`): the router's own
 * click handler on the same element would otherwise run first and navigate.
 */
export function useContactTrigger() {
  const route = useRoute()
  const getRouteBaseName = useRouteBaseName()
  const localePath = useLocalePath()
  const nuxtApp = useNuxtApp()

  const baseName = computed(() => getRouteBaseName(route))
  const opensDialog = computed(() => baseName.value !== 'index' && baseName.value !== 'contact')
  const href = computed(() => (baseName.value === 'index' ? `${localePath('index')}#contact` : localePath('contact')))

  function open(event: MouseEvent, request: ContactTriggerRequest = {}) {
    if (!opensDialog.value) return
    // A modified or middle click opens the link in a new tab, as a link should.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const target = event.currentTarget
    void nuxtApp.callHook('contact:open', { ...request, returnFocusTo: target instanceof HTMLElement ? target : null })
  }

  return { href, opensDialog, open }
}
