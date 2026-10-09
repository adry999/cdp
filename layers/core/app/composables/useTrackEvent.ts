/** Emits an analytics event on the `analytics:event` hook. Does nothing by itself: the consent layer decides whether it is sent. */
export function useTrackEvent() {
  const nuxtApp = useNuxtApp()
  return (name: string, params: Record<string, string> = {}) => {
    void nuxtApp.callHook('analytics:event', { name, params })
  }
}
