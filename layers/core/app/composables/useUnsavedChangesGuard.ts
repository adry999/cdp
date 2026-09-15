/**
 * Warns before leaving a form with unsaved edits (back button, tab close,
 * route change). `form` is any reactive object; comparison is a JSON snapshot
 * diff rather than a manual per-field dirty flag, so it stays correct as
 * fields are added.
 *
 * Call `markSaved()` after a successful save so the guard doesn't immediately
 * re-trigger on the state a save just produced.
 */
export function useUnsavedChangesGuard(form: object) {
  let savedSnapshot = JSON.stringify(form)
  const isDirty = computed(() => JSON.stringify(form) !== savedSnapshot)

  if (import.meta.client) {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty.value) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    onUnmounted(() => window.removeEventListener('beforeunload', warnBeforeUnload))
  }

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true
    return window.confirm('Ai modificări nesalvate. Sigur vrei să pleci fără să salvezi?')
  })

  function markSaved() {
    savedSnapshot = JSON.stringify(form)
  }

  return { markSaved }
}
