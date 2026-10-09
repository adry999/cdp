<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { setLocaleOverride } = useLocaleOverride()
</script>

<template>
  <header class="sticky top-0 z-20 bg-paper">
    <div class="container-site flex min-h-16 items-center justify-between gap-6">
      <NuxtLink :to="localePath('index')" class="flex items-center">
        <img
          src="/brand/codepedia-wordmark.svg"
          alt="CODEPEDIA"
          width="183"
          height="18"
          class="block h-[18px] w-auto"
        >
      </NuxtLink>
      <nav :aria-label="t('nav.main')" class="flex items-center gap-[clamp(14px,2vw,28px)] eyebrow">
        <NuxtLink :to="localePath('proiecte')" class="border-r border-hairline pr-[clamp(14px,2vw,28px)] text-muted">
          {{ t('caseStudy.back') }}
        </NuxtLink>
        <span class="flex items-center gap-1.5">
          <SwitchLocalePathLink
            locale="ro"
            hreflang="ro"
            lang="ro"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            :aria-current="locale === 'ro' ? 'true' : undefined"
            @click="setLocaleOverride('ro')"
          >
            RO
          </SwitchLocalePathLink>
          <span class="text-hairline">|</span>
          <SwitchLocalePathLink
            locale="en"
            hreflang="en"
            lang="en"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
            :aria-current="locale === 'en' ? 'true' : undefined"
            @click="setLocaleOverride('en')"
          >
            EN
          </SwitchLocalePathLink>
        </span>
      </nav>
    </div>

    <div class="h-[2px] bg-signal" />
  </header>
</template>
