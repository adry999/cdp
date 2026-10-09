<script setup lang="ts">
import { useServiceStages } from '#layers/content'

const { t } = useI18n()
const localePath = useLocalePath()
const stages = await useServiceStages()

</script>

<template>
  <!-- Full container width (no label column) so all five cards fit one row. -->
  <section id="stages" class="scroll-mt-16 border-t border-hairline">
    <div class="container-site py-[clamp(32px,4vw,56px)]">
      <div class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 no-scrollbar lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0">
        <article
          v-for="(stage, i) in stages"
          :key="stage.id"
          class="group w-[85vw] max-w-[320px] shrink-0 snap-center lg:w-[calc(33.333%-1.25rem)] lg:max-w-[360px] lg:shrink-0 flex flex-col rounded border border-hairline bg-paper p-6 text-ink transition-all duration-500 hover:-translate-y-1 hover:border-signal hover:shadow-lg"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs tracking-[0.08em] text-signal">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="eyebrow-sm text-muted transition-colors duration-500 group-hover:text-ink">
              {{ stage.timing }}
            </span>
          </div>
          <div class="mt-5 flex h-14 w-14 items-center justify-center rounded-xl bg-signal/10 text-signal transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-signal/20 group-hover:shadow-sm">
            <CoreStageIcon :stage="stage.id" class="h-7 w-7" />
          </div>
          <h2 class="m-0 mt-5 min-h-[2.6em] font-mono text-sm font-medium uppercase leading-[1.3] tracking-[0.04em] transition-colors duration-500 group-hover:text-signal">
            {{ stage.name }}
          </h2>
          <div v-if="stage.pricing" class="mt-5 text-[10px] font-medium uppercase tracking-[0.06em] text-muted">
            {{ t('pricing.engagementModel') }}
          </div>
          <div
            v-if="stage.pricing"
            class="mt-1 flex items-center gap-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink"
          >
            {{ stage.pricing }}
            <span class="group/tooltip relative inline-flex items-center">
              <button
                type="button"
                class="inline-flex h-5 w-5 cursor-default items-center justify-center rounded-full border border-rule/70 text-[11px] font-mono font-medium text-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
                aria-label="Info"
              >
                i
              </button>
              <span
                role="tooltip"
                class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(300px,85vw)] -translate-x-1/2 rounded border border-hairline bg-ink p-3 text-[13px] font-normal leading-relaxed text-paper shadow-lg opacity-0 transition-opacity duration-150 group-hover/tooltip:pointer-events-auto group-hover/tooltip:opacity-100 group-focus-within/tooltip:pointer-events-auto group-focus-within/tooltip:opacity-100 tracking-normal"
              >
                {{ stage.pricingTooltip }}
                <span class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" aria-hidden="true" />
              </span>
            </span>
          </div>
          <ul
            class="m-0 mt-5 flex flex-1 list-none flex-col gap-2 border-t border-hairline p-0 pt-4"
          >
            <li v-for="badge in stage.badges" :key="badge" class="flex gap-2 text-sm leading-[1.4]">
              <span class="text-signal" aria-hidden="true">+</span>{{ badge }}
            </li>
          </ul>
          <div class="mt-6">
            <AppButton
              variant="signal"
              :href="localePath('contact')"
            >
              {{ stage.cta }}
            </AppButton>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
