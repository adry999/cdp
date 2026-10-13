<script setup lang="ts">
import { useCookieConsent } from '#layers/consent'
import { useSiteSettings } from '#layers/content'
import { SERVICE_LINKS } from '#layers/services'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { studioGraph } from '#layers/core/shared/utils/jsonLd'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const siteLocale = useSiteLocale()
const { openSettings } = useCookieConsent()
const settings = useSiteSettings()
const cta = useContactCta()
const { grantsEnabled } = useRuntimeConfig().public
const serviceLinks = visibleServices(SERVICE_LINKS, grantsEnabled)

const services = computed(() =>
  serviceLinks.map((service) => ({
    slug: service.slug,
    name: pick(service.name.ro, service.name.en, locale.value),
    to: localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[siteLocale.value] } }),
  })),
)

const studioLinks = computed(() => [
  { id: 'work', label: t('nav.projects'), to: localePath('proiecte') },
  { id: 'pricing', label: t('nav.pricing'), to: localePath('preturi') },
  { id: 'about', label: t('nav.about'), to: localePath('despre') },
  { id: 'blog', label: t('nav.blog'), to: localePath('blog') },
  { id: 'news', label: t('nav.news'), to: localePath('noutati') },
  { id: 'contact', label: t('nav.contact'), to: localePath('contact') },
])

const legalLine = computed(() => `© ${settings.value.copyrightYear} ${settings.value.footerLine}`)

// The one Organization (and LocalBusiness) of the page, on the official domain of the locale.
// Only what the site already states: city, markets, languages and services; no street, phone or geo.
const origin = useSiteUrl()
const error = useError()
useJsonLd(() =>
  error.value
    ? null
    : studioGraph({
        origin,
        // Raster, square, ≥ 112 px: what Google accepts for an Organization logo.
        logoUrl: `${origin}/icon-512.png`,
        email: settings.value.contactEmail,
        locality: 'Chișinău',
        country: 'MD',
        areaServed: ['MD', 'RO', 'EU', 'US', 'CA'],
        languages: ['ro', 'en'],
        serviceNames: services.value.map((service) => service.name),
      }),
)

const columnLabelClass = 'eyebrow-sm text-muted'
// Rows grow to 44px on mobile and 32px on desktop; the gap shrinks so the column keeps about the same height.
const linkClass = 'py-2.5 text-[15px] text-ink no-underline hover:text-signal-text hover:no-underline nav:py-1'
const ctaClass =
  'inline-flex w-fit cursor-pointer items-center gap-2.5 rounded border-0 bg-signal px-4 py-[11px] text-[15px] font-medium text-ink no-underline transition-colors hover:bg-ink hover:text-paper hover:no-underline'
</script>

<template>
  <footer class="border-t border-hairline">
    <div
      class="container-site grid grid-fit-safe-200 gap-[clamp(32px,4vw,48px)] pb-[clamp(32px,4vw,48px)] pt-[clamp(48px,6vw,80px)]"
    >
      <div class="flex min-w-0 flex-col gap-[18px]">
        <NuxtLink :to="localePath('index')" class="tap-y flex w-fit">
          <img src="/brand/codepedia-wordmark.svg" alt="CODEPEDIA" width="163" height="16" class="block h-4 w-auto dark:hidden">
          <img src="/brand/codepedia-wordmark-on-dark.svg" alt="CODEPEDIA" width="163" height="16" class="hidden h-4 w-auto dark:block">
        </NuxtLink>
        <p class="m-0 max-w-[30ch] text-[15px] leading-normal text-muted text-pretty">{{ t('footer.tagline') }}</p>

        <a v-if="cta.kind.value === 'anchor'" :href="cta.to.value" :class="ctaClass">
          {{ t('nav.letsTalk') }} <span aria-hidden="true">→</span>
        </a>
        <NuxtLink v-else-if="cta.kind.value === 'link'" :to="cta.to.value" :class="ctaClass">
          {{ t('nav.letsTalk') }} <span aria-hidden="true">→</span>
        </NuxtLink>
        <button
          v-else
          type="button"
          :class="ctaClass"
          aria-haspopup="dialog"
          @click="cta.activate($event.currentTarget as HTMLElement)"
        >
          {{ t('nav.letsTalk') }} <span aria-hidden="true">→</span>
        </button>
      </div>

      <nav :aria-label="t('nav.services')" class="flex flex-col gap-0 nav:gap-2">
        <span :class="[columnLabelClass, 'mb-1 nav:mb-0.5']">{{ t('nav.services') }}</span>
        <NuxtLink v-for="service in services" :key="service.slug" :to="service.to" :class="linkClass">
          {{ service.name }}
        </NuxtLink>
      </nav>

      <nav :aria-label="t('footer.studioLabel')" class="flex flex-col gap-0 nav:gap-2">
        <span :class="[columnLabelClass, 'mb-1 nav:mb-0.5']">{{ t('footer.studioLabel') }}</span>
        <NuxtLink v-for="link in studioLinks" :key="link.id" :to="link.to" :class="linkClass">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <BlogLatestPosts v-slot="{ posts }" :limit="3">
        <div v-if="posts.length" class="flex min-w-0 flex-col gap-3.5">
          <span :class="columnLabelClass">{{ t('blog.fromBlog') }}</span>
          <NuxtLink
            v-for="post in posts"
            :key="post.path"
            :to="post.to"
            class="flex flex-col gap-1 border-t border-hairline pt-3 text-ink no-underline hover:text-signal-text hover:no-underline"
          >
            <span class="text-[15px] font-medium leading-[1.35] text-pretty">{{ post.title }}</span>
            <span class="eyebrow-sm text-muted">{{ post.category }}</span>
          </NuxtLink>
          <NuxtLink
            :to="localePath('blog')"
            class="eyebrow tap-y w-fit text-ink underline decoration-signal underline-offset-[3px] hover:text-ink"
          >
            {{ t('footer.allPosts') }} →
          </NuxtLink>
        </div>
      </BlogLatestPosts>
    </div>

    <div class="border-t border-hairline">
      <div class="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 eyebrow-sm text-muted">
        <span class="flex items-center gap-2">
          <img
            src="/brand/codepedia-mark.svg"
            alt=""
            width="19"
            height="12"
            class="block h-3 w-auto opacity-50 dark:hidden"
          >
          <img
            src="/brand/codepedia-mark-inverse.svg"
            alt=""
            width="19"
            height="12"
            class="hidden h-3 w-auto opacity-50 dark:block"
          >
          {{ legalLine }}
        </span>
        <span class="flex items-center gap-2">
          <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-signal" />
          {{ t('home.hero.facts.itPark') }}
        </span>
        <div class="flex flex-wrap gap-x-6 gap-y-3">
          <NuxtLink :to="localePath('confidentialitate')" class="tap-y text-muted no-underline hover:text-ink hover:no-underline">
            {{ t('footer.privacy') }}
          </NuxtLink>
          <button
            type="button"
            class="tap-y cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-ink"
            @click="openSettings"
          >
            {{ t('footer.cookieSettings') }}
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
