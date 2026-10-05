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
    <SiteSection number="—" :label="t('home.about.sectionLabel')" inverted padding="xl">
      <h1 class="m-0 max-w-[18ch] text-[clamp(34px,5.4vw,60px)] font-semibold leading-[1.04] tracking-[-0.025em] text-pretty">
        {{ t('home.about.title') }}
      </h1>
      <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-lead leading-relaxed text-body-ink">
        {{ t('home.about.lead') }}
      </p>
    </SiteSection>

    <SiteSection :label="t('about.principlesLabel')">
      <RowList>
        <RowListItem v-for="pillar in pillars" :key="pillar.id" size="lg" tag="h2" :index="pillar.index" :title="pillar.title">
          {{ pillar.body }}
        </RowListItem>
      </RowList>
    </SiteSection>

    <SiteAboutTeam />

    <section class="border-t border-hairline">
      <div class="container-site py-[clamp(40px,5vw,64px)]">
        <div class="grid grid-fit-180 gap-4">
          <FactCard v-for="id in FACT_IDS" :key="id" :label="t(`about.facts.${id}.label`)" :value="t(`about.facts.${id}.value`)" />
        </div>
      </div>
    </section>
  </div>
</template>
