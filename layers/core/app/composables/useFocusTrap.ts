import type { Ref } from 'vue'
import { focusTrapTarget } from '#layers/core/shared/utils/focusTrap'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(container: Readonly<Ref<HTMLElement | null | undefined>>) {
  function focusables(): HTMLElement[] {
    const root = container.value
    if (!root) return []
    // Hidden controls (a leaving transition step, a collapsed section) have no
    // offsetParent and must not become a wrap target.
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => element.tabIndex !== -1 && (element.offsetParent !== null || element === document.activeElement),
    )
  }

  function focusFirst() {
    focusables()[0]?.focus()
  }

  function trapTab(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const activeInside = active !== null && container.value?.contains(active) === true
    const target = focusTrapTarget(focusables(), active, event.shiftKey, activeInside)
    if (!target) return
    event.preventDefault()
    target.focus()
  }

  return { focusFirst, trapTab }
}
