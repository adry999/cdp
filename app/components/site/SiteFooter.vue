<script setup lang="ts">
import { useCookieConsent } from '#layers/consent'
import { useSiteSettings } from '#layers/content'
import { SERVICE_LINKS } from '#layers/services'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { openSettings } = useCookieConsent()
const settings = useSiteSettings()

const legalLine = computed(() => settings.value.footerLine)
const copyrightLine = computed(() => `© ${settings.value.copyrightYear}`)
</script>

<template>
  <footer class="border-t border-hairline">
    <nav
      v-if="!compact"
      :aria-label="t('footer.navLabel')"
      class="container-site flex flex-wrap gap-x-6 gap-y-3 border-b border-hairline py-5 eyebrow-sm text-muted"
    >
      <NuxtLink
        v-for="service in SERVICE_LINKS.filter(s => s.slug !== 'granturi' || useRuntimeConfig().public.grantsEnabled)"
        :key="service.slug"
        :to="localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[locale] } })"
        class="hover:text-ink"
      >
        {{ pick(service.name.ro, service.name.en, locale) }}
      </NuxtLink>
      <NuxtLink :to="localePath('servicii')" class="hover:text-ink">{{ t('nav.services') }}</NuxtLink>
      <NuxtLink :to="localePath('preturi')" class="hover:text-ink">{{ t('nav.pricing') }}</NuxtLink>
      <NuxtLink :to="localePath('despre')" class="hover:text-ink">{{ t('nav.about') }}</NuxtLink>
      <NuxtLink :to="localePath('contact')" class="hover:text-ink">{{ t('nav.contact') }}</NuxtLink>
      <NuxtLink :to="localePath('proiecte')" class="hover:text-ink">{{ t('nav.work') }}</NuxtLink>
      <NuxtLink :to="localePath('blog')" class="hover:text-ink">{{ t('nav.blog') }}</NuxtLink>
      <NuxtLink :to="localePath('confidentialitate')" class="hover:text-ink">{{ t('footer.privacy') }}</NuxtLink>
    </nav>

    <div
      class="container-site flex flex-wrap items-baseline justify-between gap-4 py-6 eyebrow-sm text-muted"
    >
      <span class="flex items-center gap-2">
        <img
          src="/brand/codepedia-mark.svg"
          alt=""
          width="19"
          height="12"
          class="block h-3 w-auto opacity-50"
        >
        {{ legalLine }}
      </span>
      <span v-if="!compact">{{ t('footer.tagline') }}</span>
      <button type="button" class="cursor-pointer bg-transparent text-muted hover:text-ink" @click="openSettings">
        {{ t('footer.cookieSettings') }}
      </button>
      <span>{{ copyrightLine }}</span>
    </div>
  </footer>
</template>
