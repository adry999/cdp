/** What `POST /api/admin/news/preview` returns: metadata read from the source page, never its HTML. */
export interface NewsPreview {
  title: string | null
  siteName: string | null
  author: string | null
  /** `YYYY-MM-DD`. */
  publishedOn: string | null
  /** The URL after redirects. */
  finalUrl: string
}
