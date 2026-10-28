import type { MaybeRefOrGetter } from 'vue'
import { BRAND, clampDescription, resolveOgImage, withBrand } from '#layers/core/shared/utils/seo'

interface PageSeo {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  ogTitle?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | null | undefined>
  /** Pixel size of `image` when known; without it the image's width and height tags are left out. */
  imageSize?: { width: number; height: number }
  imageAlt?: MaybeRefOrGetter<string | undefined>
  type?: 'website' | 'article'
  /** `article:*` Open Graph tags; only meaningful with `type: 'article'`. */
  article?: { publishedTime: string; modifiedTime: string; section: string }
}

export function usePageSeo({ title, description, ogTitle, image, imageSize, imageAlt, type = 'website', article }: PageSeo) {
  const defaultImage = `${useSiteUrl()}/og-image.png`

  // Replaces the static `%s · CODEPEDIA` template so long titles drop the suffix.
  useHead({ titleTemplate: (pageTitle?: string) => (pageTitle ? withBrand(pageTitle) : BRAND) })

  const og = computed(() =>
    resolveOgImage({
      image: toValue(image),
      imageSize,
      imageAlt: toValue(imageAlt),
      defaultUrl: defaultImage,
      fallbackAlt: toValue(ogTitle ?? title),
    }),
  )

  useSeoMeta({
    title: () => toValue(title),
    description: () => clampDescription(toValue(description)),
    ogTitle: () => withBrand(toValue(ogTitle ?? title)),
    ogDescription: () => clampDescription(toValue(description)),
    ogImage: () => og.value.url,
    ogImageWidth: () => og.value.width,
    ogImageHeight: () => og.value.height,
    ogImageAlt: () => og.value.alt,
    ogSiteName: BRAND,
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: () => withBrand(toValue(ogTitle ?? title)),
    twitterDescription: () => clampDescription(toValue(description)),
    twitterImage: () => og.value.url,
    twitterImageAlt: () => og.value.alt,
    ...(article
      ? { articlePublishedTime: article.publishedTime, articleModifiedTime: article.modifiedTime, articleSection: article.section }
      : {}),
  })
}
