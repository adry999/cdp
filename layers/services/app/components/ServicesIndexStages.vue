<script setup lang="ts">
import { useServiceStages } from '#layers/content'


const { t } = useI18n()
const stages = await useServiceStages()

// Removed servicesFor since links were cleaned up
</script>

<template>
  <SiteSection
    v-for="(stage, i) in stages"
    :key="stage.id"
    padding="xs"
  >
    <template #label>
      <span class="font-mono text-[clamp(32px,4vw,48px)] font-medium leading-none text-signal-text">
        {{ String(i + 1).padStart(2, '0') }}
      </span>
    </template>
    <article>
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 class="m-0 flex items-center gap-3 font-mono text-[clamp(18px,2.2vw,22px)] font-medium uppercase leading-tight tracking-[0.04em]">
          <CoreStageIcon :stage="stage.id" class="text-signal w-6 h-6" />
          {{ stage.name }}
        </h2>
        <span class="eyebrow text-muted">{{ stage.priceTime }}</span>
      </div>
      <div class="mt-6 grid grid-fit-safe-280 gap-6">
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal">{{ t('home.services.whereYouAreLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty text-muted transition-colors duration-500 group-hover:text-ink">{{ stage.whereYouAre }}</p>
        </div>
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal">{{ t('home.services.whyUsLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty text-muted transition-colors duration-500 group-hover:text-ink">{{ stage.whyUs }}</p>
        </div>
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal">{{ t('home.services.whatYouGetLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty text-muted transition-colors duration-500 group-hover:text-ink">{{ stage.whatYouGet }}</p>
        </div>
      </div>
      <ul class="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
        <li v-for="badge in stage.badges" :key="badge">
          <TechChip :label="badge" />
        </li>
      </ul>
      <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
        <QualifierCta variant="ink" :stage="stage.id">{{ stage.cta }}</QualifierCta>
      </div>
    </article>
  </SiteSection>
</template>
