<script setup lang="ts">
import { SERVICE_LINKS } from '#layers/services/data/serviceLinks'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { grantsEnabled } = useRuntimeConfig().public

const links = computed(() =>
  SERVICE_LINKS.filter((service) => service.slug !== 'granturi' || grantsEnabled).map((service) => ({
    slug: service.slug,
    label: service.routeSlug[locale.value],
    to: localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[locale.value] } }),
  })),
)
</script>

<template>
  <nav :aria-label="t('nav.services')" class="border-b border-hairline bg-hatch">
    <div class="container-site flex flex-wrap items-center gap-1.5 py-2.5">
      <NuxtLink :to="localePath({ name: 'servicii' })" class="tap-y mr-2 eyebrow-sm text-muted hover:text-signal-text">
        /{{ t('nav.services') }}/
      </NuxtLink>
      <NuxtLink
        v-for="link in links"
        :key="link.slug"
        :to="link.to"
        class="tap-y rounded border border-hairline px-2.5 py-1.5 eyebrow-sm text-muted hover:text-signal-text aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
