import type { PostService } from './frontMatter'

interface PerLocale {
  ro: string
  en: string
}

interface ServicePage {
  /** Route segment of `/servicii/<slug>` (RO) and `/en/services/<slug>` (EN). */
  slug: PerLocale
  name: PerLocale
}

// The blog depends on `core` only, so the few service pages a post can point to are mirrored here
// (the front matter validator already limits `service` to these keys).
export const POST_SERVICE_PAGES: Readonly<Record<PostService, ServicePage>> = {
  website: { slug: { ro: 'website', en: 'website' }, name: { ro: 'Website', en: 'Website' } },
  'aplicatie-web': { slug: { ro: 'aplicatie-web', en: 'web-app' }, name: { ro: 'Aplicație web', en: 'Web app' } },
  wordpress: { slug: { ro: 'wordpress', en: 'wordpress' }, name: { ro: 'WordPress', en: 'WordPress' } },
  shopify: { slug: { ro: 'shopify', en: 'shopify' }, name: { ro: 'Shopify', en: 'Shopify' } },
  'automatizare-ai': { slug: { ro: 'automatizare-ai', en: 'ai-automation' }, name: { ro: 'Automatizare cu AI', en: 'AI automation' } },
  granturi: { slug: { ro: 'granturi', en: 'grants' }, name: { ro: 'Proiecte finanțate prin granturi', en: 'Grant-funded projects' } },
}
