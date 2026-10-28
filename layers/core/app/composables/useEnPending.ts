// Whether the page being shown has no real English copy yet (its EN text is still Romanian). Dynamic
// pages (news, case studies) know this only after loading the item, so they declare it here; the
// hreflang plugin then drops the EN alternate and points x-default at the RO page.
function useEnPendingState() {
  return {
    pending: useState<boolean>('core:en-pending', () => false),
    owner: useState<number>('core:en-pending-owner', () => 0),
  }
}

/** Declares, on every render of a dynamic page and in both locales, whether its EN copy is untranslated. */
export function useSetEnPending(pending: MaybeRefOrGetter<boolean>) {
  const state = useEnPendingState()
  const owner = getCurrentInstance()?.uid ?? 0
  state.owner.value = owner
  watchEffect(() => {
    if (state.owner.value === owner) state.pending.value = toValue(pending)
  })
  // A newer page may already have taken over when this one is torn down.
  onScopeDispose(() => {
    if (state.owner.value === owner) {
      state.pending.value = false
      state.owner.value = 0
    }
  })
}

/** True while the shown dynamic page declared its EN copy untranslated. */
export function useIsEnPending(): ComputedRef<boolean> {
  const { pending } = useEnPendingState()
  return computed(() => pending.value)
}
