<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const caseStudySlugs = useCaseStudySlugs()

const localeOverride = useCookie<string | null>(LOCALE_COOKIE_NAME, {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
})

function setLocaleOverride(loc: 'ro' | 'en') {
  localeOverride.value = loc
}

// Falls back to switchLocalePath() before the page has set the slug pair
// (e.g. mid-navigation, before hydration completes). See resolveCaseStudySlug
// for why this can't just reuse the current route's slug.
function caseStudyLocalePath(target: 'ro' | 'en') {
  const slug = resolveCaseStudySlug(caseStudySlugs.value, target)
  if (!slug) return switchLocalePath(target)
  return localePath({ name: 'proiecte-slug', params: { slug } }, target)
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-hairline bg-paper">
    <div class="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-6 px-gutter">
      <NuxtLink :to="localePath('index')" aria-label="Codepedia" class="flex items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="Codepedia"
          width="183"
          height="18"
          class="block h-[18px] w-auto"
        />
      </NuxtLink>
      <nav class="flex items-center gap-[clamp(14px,2vw,28px)] font-mono text-xs uppercase tracking-[0.08em]">
        <NuxtLink
          :to="`${localePath('index')}#proiecte`"
          class="border-r border-hairline pr-[clamp(14px,2vw,28px)] text-muted"
        >
          {{ t('caseStudy.back') }}
        </NuxtLink>
        <span class="flex items-center gap-1.5">
          <NuxtLink
            :to="caseStudyLocalePath('ro')"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            @click="setLocaleOverride('ro')"
          >
            RO
          </NuxtLink>
          <span class="text-hairline">|</span>
          <NuxtLink
            :to="caseStudyLocalePath('en')"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            @click="setLocaleOverride('en')"
          >
            EN
          </NuxtLink>
        </span>
      </nav>
    </div>
  </header>
</template>
