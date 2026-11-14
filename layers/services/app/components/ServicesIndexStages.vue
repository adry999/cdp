<script setup lang="ts">
import type { StageId } from '#layers/core/shared/types/service-stage'
import { visibleServices } from '#layers/core/shared/utils/visibleServices'
import { useServiceStages } from '#layers/content'
import { SERVICE_LINKS } from '#layers/services/data/serviceLinks'

const { t } = useI18n()
const stages = useServiceStages()
const siteLocale = useSiteLocale()
const localePath = useLocalePath()
const { grantsEnabled } = useRuntimeConfig().public

// The service pages of a stage (the services whose qualifier stage it is); a stage without one shows no row.
const offeredServices = visibleServices(SERVICE_LINKS, grantsEnabled)
function stageServices(stage: StageId) {
  return offeredServices
    .filter((service) => service.qualifierStage === stage)
    .map((service) => ({
      slug: service.slug,
      name: service.name[siteLocale.value],
      to: localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[siteLocale.value] } }),
    }))
}
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
    <article class="group">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 class="m-0 flex items-center gap-3 font-mono text-[clamp(18px,2.2vw,22px)] font-medium uppercase leading-tight tracking-[0.04em]">
          <CoreStageIcon :stage="stage.id" class="h-6 w-6 text-muted transition-colors duration-300 group-hover:text-signal" />
          {{ stage.name }}
        </h2>
        <span class="eyebrow text-muted">{{ stage.priceTime }}</span>
      </div>
      <div class="mt-6 grid grid-fit-safe-280 gap-6">
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal-text">{{ t('home.services.whereYouAreLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty text-muted transition-colors duration-500 group-hover:text-ink">{{ stage.whereYouAre }}</p>
        </div>
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal-text">{{ t('home.services.whyUsLabel') }}</div>
          <p class="m-0 mt-2.5 text-base text-pretty text-muted transition-colors duration-500 group-hover:text-ink">{{ stage.whyUs }}</p>
        </div>
        <div class="group border-l-[3px] border-hairline pl-5 py-1 transition-all duration-500 hover:border-signal hover:translate-x-2 cursor-default">
          <div class="eyebrow text-muted transition-colors duration-500 group-hover:text-signal-text">{{ t('home.services.whatYouGetLabel') }}</div>
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
        <!-- As in Codepedia Pagini.dc.html: the stage's service pages sit in the button row as mono "Name →" links. -->
        <NuxtLink
          v-for="service in stageServices(stage.id)"
          :key="service.slug"
          :to="service.to"
          class="tap-y eyebrow text-muted no-underline transition-colors hover:text-signal-text hover:underline"
        >
          {{ service.name }} →
        </NuxtLink>
      </div>
    </article>
  </SiteSection>
</template>
