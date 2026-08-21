<script setup lang="ts">
import { privacyPolicy } from '~/data/legal'

const { locale } = useI18n()
const content = computed(() => privacyPolicy[locale.value as 'ro' | 'en'])

useSeoMeta({
  title: () => content.value.title,
  robots: 'noindex, follow',
})
</script>

<template>
  <div class="mx-auto max-w-[720px] px-gutter py-[clamp(48px,8vw,96px)]">
    <h1 class="m-0 max-w-[28ch] text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em]">
      {{ content.title }}
    </h1>
    <p class="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ content.updated }}</p>
    <p class="mt-6 text-base text-muted">{{ content.intro }}</p>

    <div class="mt-10 flex flex-col gap-8">
      <div v-for="section in content.sections" :key="section.heading">
        <h2 class="m-0 text-lg font-medium">{{ section.heading }}</h2>
        <p v-for="(paragraph, i) in section.body" :key="i" class="mt-2 text-base text-muted">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </div>
</template>
