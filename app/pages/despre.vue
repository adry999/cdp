<script setup lang="ts">
import { useAboutPillars } from '#layers/content'

const { t } = useI18n()
const pillars = useAboutPillars()

const FACT_IDS = ['based', 'markets', 'languages'] as const

usePageSeo({
  title: () => t('home.about.title'),
  description: () => t('about.seo.description'),
})
</script>

<template>
  <div>
    <SiteSection number="—" :label="t('home.about.sectionLabel')" inverted padding="ink">
      <h1 class="m-0 max-w-[18ch] text-[clamp(34px,5.4vw,60px)] font-semibold leading-[1.04] tracking-[-0.025em]" style="text-wrap: pretty">
        {{ t('home.about.title') }}
      </h1>
      <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] leading-relaxed text-body-ink">
        {{ t('home.about.lead') }}
      </p>
    </SiteSection>

    <SiteSection number="" label="" padding-y="clamp(48px,6vw,96px)">
      <template #label>
        <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('about.principlesLabel') }}</span>
      </template>
      <div class="flex flex-col border-b border-hairline">
        <div
          v-for="pillar in pillars"
          :key="pillar.id"
          class="flex flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-3 border-t border-hairline py-[clamp(22px,3vw,32px)]"
        >
          <span class="flex-[0_0_48px] font-mono text-xs tracking-[0.14em] text-signal">{{ pillar.index }}</span>
          <h2 class="m-0 flex-[0_0_260px] text-xl font-medium tracking-[-0.02em]">{{ pillar.title }}</h2>
          <p class="m-0 flex-[1_1_300px] text-base text-muted">{{ pillar.body }}</p>
        </div>
      </div>
    </SiteSection>

    <SiteAboutTeam />

    <section class="border-t border-hairline">
      <div class="mx-auto max-w-[1280px] px-gutter py-[clamp(40px,5vw,64px)]">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <FactCard v-for="id in FACT_IDS" :key="id" :label="t(`about.facts.${id}.label`)" :value="t(`about.facts.${id}.value`)" />
        </div>
      </div>
    </section>
  </div>
</template>
