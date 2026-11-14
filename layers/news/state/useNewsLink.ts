import { fetchNewsCount } from '#layers/news/data/newsRepository'
import { showsNewsLink } from '#layers/news/domain/newsLink'

// The footer sits on every page: a failing database hides the news link instead of breaking the page.
// Prerendered pages (the blog) would bake the answer at build time and keep it until the next deploy,
// so there the count is fetched on the client. SWR pages keep it in the server payload and are
// refreshed by POST /api/admin/revalidate, like the header's project menu (useNavProjects).
export function useNewsLink() {
  const { data } = useAsyncData(
    'news-count',
    async () => {
      try {
        return await fetchNewsCount()
      } catch (error) {
        console.warn('[nav] news count unavailable, hiding the news link', error)
        return null
      }
    },
    { server: !import.meta.prerender },
  )
  const showNewsLink = computed(() => showsNewsLink(data.value))
  return { showNewsLink }
}
