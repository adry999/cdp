/**
 * Warns before leaving a form with unsaved edits — the admin's single-button
 * save forms had no protection against a stray back-button or an accidental
 * tab close discarding everything typed. `form` is any reactive object;
 * comparison is a JSON snapshot diff rather than a manual per-field dirty
 * flag, so it stays correct as fields are added.
 *
 * Call `markSaved()` after a successful save so the guard doesn't immediately
 * re-trigger on the state a save just produced.
 */
export function useUnsavedChangesGuard(form: object) {
  let savedSnapshot = JSON.stringify(form)
  const isDirty = computed(() => JSON.stringify(form) !== savedSnapshot)

  if (import.meta.client) {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty.value) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    onUnmounted(() => window.removeEventListener('beforeunload', handler))
  }

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true
    return window.confirm('Ai modificări nesalvate. Sigur vrei să pleci fără să salvezi?')
  })

  function markSaved() {
    savedSnapshot = JSON.stringify(form)
  }

  return { isDirty, markSaved }
}
