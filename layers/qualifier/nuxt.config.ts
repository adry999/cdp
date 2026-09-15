export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // Gates the qualification modal and POST /api/contact. Unset, the call
      // to action buttons fall back to the anchor link and the inline LeadsContactForm.
      qualifierEnabled: process.env.NUXT_PUBLIC_QUALIFIER_ENABLED === 'true',
    },
  },
})
