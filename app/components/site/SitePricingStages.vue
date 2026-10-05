<script setup lang="ts">
import { useServiceStages } from '#layers/content'

const { t } = useI18n()
const localePath = useLocalePath()
const stages = useServiceStages()

// The stage the prototype highlights (Design → cod) gets the inverted card.
const FEATURED_STAGE = 'A'
</script>

<template>
  <!-- Full container width like the prototype: no 160px label column, so all five cards fit one row. -->
  <section id="stages" class="scroll-mt-16 border-t border-hairline">
    <div class="mx-auto max-w-[1280px] px-gutter" style="padding-top: clamp(32px, 4vw, 56px); padding-bottom: clamp(32px, 4vw, 56px)">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
        <article
          v-for="(stage, i) in stages"
          :key="stage.id"
          class="flex flex-col rounded border p-6"
          :class="stage.id === FEATURED_STAGE ? 'border-ink bg-ink text-paper' : 'border-hairline bg-paper text-ink'"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs tracking-[0.08em] text-signal">{{ String(i + 1).padStart(2, '0') }}</span>
            <span
              class="font-mono text-[11px] uppercase tracking-[0.08em]"
              :class="stage.id === FEATURED_STAGE ? 'text-body-ink' : 'text-muted'"
            >
              {{ t(`pricing.stages.${stage.id}.time`) }}
            </span>
          </div>
          <h2 class="m-0 mt-4 min-h-[2.6em] font-mono text-sm font-medium uppercase leading-[1.3] tracking-[0.04em]">
            {{ stage.name }}
          </h2>
          <div
            class="mt-5 font-mono text-[11px] uppercase tracking-[0.08em]"
            :class="stage.id === FEATURED_STAGE ? 'text-body-ink' : 'text-muted'"
          >
            {{ t(`pricing.stages.${stage.id}.pricePrefix`) }}
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
              :variant="stage.id === FEATURED_STAGE ? 'signal' : 'outline'"
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
