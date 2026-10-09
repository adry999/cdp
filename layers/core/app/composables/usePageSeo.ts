import type { MaybeRefOrGetter } from 'vue'

interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | null | undefined>
  type?: 'website' | 'article'
  /** `article:*` Open Graph tags; only meaningful with `type: 'article'`. */
  article?: { publishedTime: string; modifiedTime: string; section: string }
}

export function usePageSeo({ title, description, ogTitle, image, type = 'website', article }: PageSeo) {
  const defaultImage = `${useSiteUrl()}/og-image.png`

  useSeoMeta({
    title: () => toValue(title),
    description: () => toValue(description),
    ogTitle: () => toValue(ogTitle ?? title),
    ogDescription: () => toValue(description),
    ogImage: () => toValue(image) ?? defaultImage,
    ogType: type,
    twitterCard: 'summary_large_image',
    ...(article
      ? { articlePublishedTime: article.publishedTime, articleModifiedTime: article.modifiedTime, articleSection: article.section }
      : {}),
  })
}
