import type { NewsRow } from '#layers/news/domain/newsSelect'

export function fetchNewsList() {
  return $fetch<NewsRow[]>('/api/news')
}

export function fetchNewsItem(slug: string) {
  return $fetch<NewsRow>(`/api/news/${encodeURIComponent(slug)}`)
}
