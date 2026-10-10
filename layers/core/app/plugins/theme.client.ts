export default defineNuxtPlugin((nuxtApp) => {
  // After hydration, so the first client render equals the server render.
  nuxtApp.hook('app:mounted', () => useTheme().initTheme())
})
