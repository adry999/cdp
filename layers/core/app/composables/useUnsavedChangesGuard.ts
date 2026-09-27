// Compares a JSON snapshot rather than a manual per-field dirty flag, so new fields stay
// covered automatically. Call `markSaved()` after a successful save.
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
