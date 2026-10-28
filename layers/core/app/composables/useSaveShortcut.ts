import { isSaveShortcut } from '#layers/core/shared/utils/isSaveShortcut'

// Ctrl/Cmd+S runs `save` instead of the browser's "save page". `enabled` returns false while a
// save or upload is already in flight, so the shortcut obeys the same blocks as the button.
export function useSaveShortcut(save: () => unknown, options: { enabled?: () => boolean } = {}) {
  function onKeydown(event: KeyboardEvent) {
    if (!isSaveShortcut(event)) return
    event.preventDefault()
    if (options.enabled && !options.enabled()) return
    void save()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
