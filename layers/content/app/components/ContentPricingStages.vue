<script setup lang="ts">
import { useServiceStages } from '#layers/content'

const { t } = useI18n()
const localePath = useLocalePath()
const stages = useServiceStages()

</script>

<template>
  <SiteSection id="stages" number="01" :label="t('pricing.stagesLabel')" padding="sm">
    <div class="grid grid-fit-safe-280 gap-4">
      <article
        v-for="(stage, i) in stages"
        :key="stage.id"
        class="group flex flex-col rounded border border-hairline bg-paper p-6 text-ink transition-all duration-500 hover:-translate-y-1 hover:border-signal hover:shadow-lg"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-xs tracking-[0.08em] text-signal-text">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="eyebrow-sm text-muted transition-colors duration-500 group-hover:text-ink">
            {{ stage.timing }}
          </span>
        </div>
        <div class="mt-5 flex h-14 w-14 items-center justify-center rounded-xl bg-hatch text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-signal/10 group-hover:text-signal group-hover:shadow-sm">
          <CoreStageIcon :stage="stage.id" class="h-7 w-7" />
        </div>
        <h2 class="m-0 mt-5 min-h-[2.6em] font-mono text-sm font-medium uppercase leading-[1.3] tracking-[0.04em] transition-colors duration-500 group-hover:text-signal-text">
          {{ stage.name }}
        </h2>
        <div v-if="stage.pricing" class="mt-5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
          {{ t('pricing.engagementModel') }}
        </div>
        <div
          v-if="stage.pricing"
          class="mt-1 flex items-center gap-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink"
        >
          {{ stage.pricing }}
          <CoreInfoTip :label="t('pricing.infoLabel')">
            {{ stage.pricingTooltip }}
          </CoreInfoTip>
        </div>
        <ul
          class="m-0 mt-5 flex flex-1 list-none flex-col gap-2 border-t border-hairline p-0 pt-4"
        >
          <li v-for="badge in stage.badges" :key="badge" class="flex gap-2 text-sm leading-[1.4]">
            <span class="text-signal-text" aria-hidden="true">+</span>{{ badge }}
          </li>
        </ul>
        <div class="mt-6">
          <!-- One signal button per viewport: the first stage is the primary CTA. -->
          <AppButton :variant="i === 0 ? 'signal' : 'outline'" :href="localePath('contact')">
            {{ stage.cta }}
          </AppButton>
        </div>
      </article>
    </div>
  </SiteSection>
</template>
