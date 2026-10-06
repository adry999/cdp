// A preview deployment (NUXT_PUBLIC_NOINDEX=true) must stay out of search results.
// The header covers every response, cached ISR pages included.
export default defineEventHandler((event) => {
  if (useRuntimeConfig(event).public.noindex) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
