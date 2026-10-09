<script setup lang="ts">
import { useServiceStages } from '#layers/content'

const { t } = useI18n()
const localePath = useLocalePath()
const stages = await useServiceStages()

// The highlighted stage (Design → cod) gets the inverted card.
// The stage price comes from useServiceStages; the large figure shows only once `pricing.stages.<id>.price` exists.
const FEATURED_STAGE = 'A'
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
          <div
            v-if="stage.pricing"
            class="mt-5 eyebrow-sm"
            :class="stage.id === FEATURED_STAGE ? 'text-body-ink' : 'text-muted'"
          >
            {{ stage.pricing }}
          </div>
          <div class="mt-1 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em]">
            {{ t('pricing.pricePlaceholder') }}
          </div>
          <ul
            class="m-0 mt-5 flex flex-1 list-none flex-col gap-2 border-t p-0 pt-4"
            :class="stage.id === FEATURED_STAGE ? 'border-hairline-ink' : 'border-hairline'"
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
