<script setup lang="ts">
import type { StageId } from '#layers/core/shared/types/service-stage'
import { useServiceStages } from '#layers/content'
import { SERVICE_LINKS } from '#layers/services/data/serviceLinks'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const stages = useServiceStages()

// Same grouping as the homepage timeline: a service page is listed under the stage
// its `qualifierStage` names, so stages without a matching page list none.
function servicesFor(stageId: StageId) {
  return SERVICE_LINKS.filter((service) => service.qualifierStage === stageId)
}
</script>

<template>
  <SiteSection
    v-for="(stage, i) in stages"
    :key="stage.id"
    padding="xs"
  >
    <template #label>
      <span class="font-mono text-[clamp(32px,4vw,48px)] font-medium leading-none text-signal">
        {{ String(i + 1).padStart(2, '0') }}
      </span>
    </template>
    <article>
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 class="m-0 font-mono text-[clamp(18px,2.2vw,22px)] font-medium uppercase leading-tight tracking-[0.04em]">
          {{ stage.name }}
        </h2>
        <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ stage.priceTime }}</span>
      </div>
      <div class="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6">
        <div>
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('home.services.whereYouAreLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-muted text-pretty">{{ stage.whereYouAre }}</p>
        </div>
        <div>
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('home.services.whatYouGetLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty">{{ stage.whatYouGet }}</p>
        </div>
      </div>
      <ul class="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
        <li v-for="badge in stage.badges" :key="badge">
          <TechChip :label="badge" />
        </li>
      </ul>
      <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
        <QualifierCta variant="ink" :stage="stage.id">{{ stage.cta }}</QualifierCta>
        <NuxtLink
          v-for="service in servicesFor(stage.id)"
          :key="service.slug"
          :to="localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[locale] } })"
          class="font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-signal"
        >
          {{ pick(service.name.ro, service.name.en, locale) }} →
        </NuxtLink>
      </div>
    </article>
  </SiteSection>
</template>
