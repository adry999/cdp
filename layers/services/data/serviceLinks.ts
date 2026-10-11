import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import type { ServiceTagId } from '#layers/core/shared/types/service-tag'
import type { Service } from '#layers/services/domain/service'

export type ServiceLink = Pick<Service, 'slug' | 'routeSlug' | 'name' | 'qualifierStage'>

// Kept apart from SERVICES so the sitewide footer doesn't ship full page copy.
export const SERVICE_LINKS: readonly ServiceLink[] = [
  { slug: 'website', routeSlug: { ro: 'website', en: 'website' }, name: { ro: 'Website', en: 'Website' }, qualifierStage: 'E' },
  { slug: 'web-app', routeSlug: { ro: 'aplicatie-web', en: 'web-app' }, name: { ro: 'Aplicație web', en: 'Web app' }, qualifierStage: 'A' },
  { slug: 'wordpress', routeSlug: { ro: 'wordpress', en: 'wordpress' }, name: { ro: 'WordPress', en: 'WordPress' }, qualifierStage: 'E' },
  { slug: 'shopify', routeSlug: { ro: 'shopify', en: 'shopify' }, name: { ro: 'Shopify', en: 'Shopify' }, qualifierStage: 'E' },
  { slug: 'ai-automation', routeSlug: { ro: 'automatizare-ai', en: 'ai-automation' }, name: { ro: 'Automatizare cu AI', en: 'AI automation' }, qualifierStage: 'D' },
  { slug: 'granturi', routeSlug: { ro: 'granturi', en: 'grants' }, name: { ro: 'Proiecte finanțate prin granturi', en: 'Grant-funded projects' }, qualifierStage: 'A' },
]

// One-line summaries for the header dropdown, shown when a service has no projects to list.
// Shorter than each page's intro, and kept here so the sitewide header doesn't ship page copy.
export const SERVICE_NAV_INTRO: Readonly<Record<ServiceTagId, LocalizedText>> = {
  website: {
    ro: 'O pagină de prezentare modernă care-ți validează ideea și atrage primii clienți.',
    en: 'A modern presentation site that validates your idea and brings in the first clients.',
  },
  'web-app': {
    ro: 'Aplicația ta, din design în cod de producție, pe Postgres și Nuxt sau Next.',
    en: 'Your app, from design to production code, on Postgres and Nuxt or Next.',
  },
  wordpress: {
    ro: 'Site WordPress rapid, securizat și ușor de menținut, pe infrastructura modernă cu cache și CDN global.',
    en: 'A fast, secure WordPress site that is easy to maintain, on modern infrastructure with caching and a global CDN.',
  },
  shopify: {
    ro: 'Magazin Shopify optimizat pentru conversie, cu design custom și integrări cu logistica și analitică reală.',
    en: 'A Shopify store built for conversion, with custom design and integrations for logistics and real analytics.',
  },
  'ai-automation': {
    ro: 'Sisteme AI custom integrate în fluxul tău de lucru, care reduc zeci de ore manuale pe lună și reduc costurile operaționale.',
    en: 'Custom AI systems built into your workflow that remove dozens of manual hours a month and lower operating costs.',
  },
  granturi: {
    ro: 'Ai câștigat un grant european sau ODA și trebuie să livrezi o aplicație la termen? Construim partea tehnică a proiectului și pregătim documentele de care ai nevoie la raportare.',
    en: 'Won an EU or ODA grant and need to deliver an app on time? We build the technical side of the project and prepare the documents you need for reporting.',
  },
}
