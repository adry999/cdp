import type { MaybeRefOrGetter } from 'vue'

// Compares a JSON snapshot rather than a manual per-field dirty flag, so new fields stay
// covered automatically. Call `markSaved()` after a successful save, and after replacing the
// form with loaded data. `isDirty` drives the editors' "Modificări nesalvate" indicator.
//
// Registers a route guard and a lifecycle hook, so it must run synchronously in setup: before
// the first `await` of the calling composable. After an await there is no current component;
// vue-router's production build then throws inside onBeforeRouteLeave. Pass a getter
// (`() => form.value`) when the form is replaced once its data has loaded.
export function useUnsavedChangesGuard(source: MaybeRefOrGetter<object>) {
  // A ref, so `isDirty` recomputes when only the snapshot changes (after a save).
  const savedSnapshot = ref(JSON.stringify(toValue(source)))
  const isDirty = computed(() => JSON.stringify(toValue(source)) !== savedSnapshot.value)

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
    savedSnapshot.value = JSON.stringify(toValue(source))
  }

  return { isDirty, markSaved }
}
