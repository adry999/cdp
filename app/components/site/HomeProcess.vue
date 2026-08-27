<script setup lang="ts">
import type { HomeApiResponse } from '~/types/home'

const { t, locale } = useI18n()
const { data } = await useAsyncData<HomeApiResponse>('home', () => $fetch('/api/home'))
const steps = computed(() => data.value?.processSteps ?? [])
</script>

<template>
  <SiteSection number="03" :label="t('home.process.sectionLabel')" section-id="proces">
    <h2 class="m-0 max-w-[26ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.process.title') }}
    </h2>
    <div class="mt-[clamp(28px,3vw,40px)] flex flex-col">
      <div
        v-for="(step, i) in steps"
        :key="step.title_ro"
        class="flex flex-wrap gap-[clamp(16px,3vw,40px)] border-t border-hairline py-[clamp(20px,2.5vw,28px)]"
        :class="{ 'border-b': i === steps.length - 1 }"
      >
        <div class="flex-[0_0_80px] font-mono text-xs tracking-[0.08em] text-signal">
          {{ String(i + 1).padStart(2, '0') }}
        </div>
        <div class="flex min-w-0 flex-[1_1_340px] flex-wrap gap-[clamp(16px,3vw,40px)]">
          <h3 class="m-0 flex-[0_0_200px] text-xl font-medium tracking-[-0.02em]">
            {{ pick(step.title_ro, step.title_en, locale) }}
          </h3>
          <p class="m-0 max-w-[60ch] flex-[1_1_280px] text-base text-muted">
            {{ pick(step.body_ro, step.body_en, locale) }}
          </p>
        </div>
      </div>
    </div>
  </SiteSection>
</template>
