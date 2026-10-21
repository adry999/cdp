/**
 * The `to_path` values the `news_items_sync_redirects` trigger writes for an item:
 * `/noutati/<slug_ro>` and `/en/news/<slug_en>`, with the RO slug standing in when there is no EN one.
 */
export function newsRedirectTargets(item: { slug_ro: string; slug_en: string | null }): string[] {
  return [`/noutati/${item.slug_ro}`, `/en/news/${item.slug_en ?? item.slug_ro}`]
}
