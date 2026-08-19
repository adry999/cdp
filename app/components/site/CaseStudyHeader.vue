<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
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
            :to="switchLocalePath('ro')"
            class="no-underline hover:no-underline"
            :class="locale === 'ro' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
          >
            RO
          </NuxtLink>
          <span class="text-hairline">|</span>
          <NuxtLink
            :to="switchLocalePath('en')"
            class="no-underline hover:no-underline"
            :class="locale === 'en' ? 'text-ink hover:text-ink' : 'text-muted hover:text-muted'"
          >
            EN
          </NuxtLink>
        </span>
      </nav>
    </div>
  </header>
</template>
