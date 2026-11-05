// Every <Icon> takes its name from TECH_ICONS or STACK_GROUP_ICONS, which nuxt.config.ts puts in
// icon.clientBundle; the client loads that bundle synchronously before rendering an icon. @nuxt/icon
// still copies each SVG into the payload under `i-<name>` (over half of the home payload), so the
// copies are dropped after the render, before the payload is serialised. A new icon must go into
// clientBundle, as the convention already requires, or it would render empty after hydration.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', () => {
    for (const key of Object.keys(nuxtApp.payload.data)) {
      if (key.startsWith('i-')) Reflect.deleteProperty(nuxtApp.payload.data, key)
    }
  })
})
