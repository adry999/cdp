<script setup lang="ts">
const { locale } = useI18n()
const { setLocaleOverride } = useLocaleOverride()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const getRouteBaseName = useRouteBaseName()
const route = useRoute()
const slugs = useLocalizedSlugs()

const LANGS = ['ro', 'en'] as const
const linkClass = 'flex min-h-11 min-w-11 items-center justify-center no-underline hover:no-underline nav:min-h-8 nav:min-w-8'

// A page whose slug differs per locale sets it while it renders, after this header: the server
// cannot know it here and the client's first render would disagree with the server HTML. The
// links are therefore built on the client only (the fallback is the same text, unlinked).
function targetFor(lang: (typeof LANGS)[number]): string {
  const baseName = getRouteBaseName(route)
  if (slugs.value && typeof baseName === 'string') {
    return localePath({ name: baseName, params: { slug: slugs.value[lang] }, query: route.query }, lang)
  }
  return switchLocalePath(lang)
}
</script>

<template>
  <span class="flex items-center gap-1.5">
    <ClientOnly>
      <span class="contents">
        <template v-for="(lang, index) in LANGS" :key="lang">
          <span v-if="index > 0" aria-hidden="true" class="text-rule">/</span>
          <NuxtLink
            :to="targetFor(lang)"
            :hreflang="lang"
            :lang="lang"
            :class="[linkClass, locale === lang ? 'text-ink hover:text-signal-text' : 'text-muted hover:text-signal-text']"
            :aria-current="locale === lang ? 'true' : undefined"
            @click="setLocaleOverride(lang)"
          >
            {{ lang.toUpperCase() }}
          </NuxtLink>
        </template>
      </span>
      <template #fallback>
        <span class="contents">
          <template v-for="(lang, index) in LANGS" :key="lang">
            <span v-if="index > 0" aria-hidden="true" class="text-rule">/</span>
            <span :class="[linkClass, locale === lang ? 'text-ink' : 'text-muted']" :lang="lang">
              {{ lang.toUpperCase() }}
            </span>
          </template>
        </span>
      </template>
    </ClientOnly>
  </span>
</template>
