import type { Ref } from 'vue'

// Escape and the Tab trap for a modal dialog. The listener sits on the document, not the panel:
// when the focused control is removed or disabled, focus falls to <body>, outside the panel, and a
// panel-level listener would stop hearing the keyboard.
export function useDialogKeys(container: Readonly<Ref<HTMLElement | null | undefined>>, onEscape: () => void) {
  const { focusFirst, trapTab } = useFocusTrap(container)

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }
    trapTab(event)
  }

  function bind() {
    document.addEventListener('keydown', onKeydown)
  }

  function unbind() {
    document.removeEventListener('keydown', onKeydown)
  }

  onBeforeUnmount(unbind)

  return { focusFirst, bind, unbind }
}
