<script setup lang="ts">
import type { HomeApiResponse } from '~/types/home'

const { t, locale } = useI18n()
const { data } = await useAsyncData<HomeApiResponse>('home', () => $fetch('/api/home'))
const services = computed(() => data.value?.services ?? [])
const level1 = computed(() => services.value[0])
const level2 = computed(() => services.value[1])

function priceLabel(row?: { duration_ro: string | null; duration_en: string | null; price_from: number | null; currency: string }) {
  if (!row) return ''
  const duration = pick(row.duration_ro ?? '', row.duration_en, locale.value)
  const price =
    row.price_from != null
      ? `${locale.value === 'en' ? 'from' : 'de la'} ${row.price_from} ${row.currency}`
      : `${locale.value === 'en' ? 'from' : 'de la'} [ X ] ${row.currency}`
  return [duration, price].filter(Boolean).join(' · ')
}
</script>

<template>
  <SiteSection number="01" :label="t('home.services.sectionLabel')" section-id="servicii">
    <h2 class="m-0 max-w-[26ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.services.title') }}
    </h2>

    <div v-if="level1" class="mt-[clamp(28px,3vw,40px)] rounded border border-hairline p-[clamp(20px,2.5vw,28px)]">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
          <span class="text-signal">{{ pick(level1.level_label_ro, level1.level_label_en, locale) }}</span> /
          {{ pick(level1.name_ro, level1.name_en, locale) }}
        </div>
        <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ priceLabel(level1) }}</div>
      </div>
      <h3 class="mb-2.5 mt-4 text-xl font-medium tracking-[-0.02em]">
        {{ pick(level1.heading_ro, level1.heading_en, locale) }}
      </h3>
      <p class="mb-5 mt-0 max-w-[62ch] text-base text-muted">{{ pick(level1.body_ro, level1.body_en, locale) }}</p>
      <div class="flex flex-col">
        <TableRow
          v-for="(row, i) in level1.service_items"
          :key="row.label_ro"
          :label="pick(row.label_ro, row.label_en, locale)"
          label-width="200px"
          :last="i === level1.service_items.length - 1"
        >
          <p class="m-0 max-w-[56ch] text-base">{{ pick(row.body_ro, row.body_en, locale) }}</p>
        </TableRow>
      </div>
    </div>

    <div v-if="level2" class="mt-[clamp(28px,3vw,40px)] border-t border-hairline pt-4">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
          <span class="text-signal">{{ pick(level2.level_label_ro, level2.level_label_en, locale) }}</span> /
          {{ pick(level2.name_ro, level2.name_en, locale) }}
        </div>
        <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ priceLabel(level2) }}</div>
      </div>
      <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ pick(level2.body_ro, level2.body_en, locale) }}</p>
      <div class="mt-5 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        <div
          v-for="(card, i) in level2.service_items"
          :key="card.label_ro"
          class="rounded border border-hairline bg-paper p-[clamp(20px,2.5vw,28px)]"
        >
          <div class="font-mono text-xs tracking-[0.08em] text-signal">{{ String(i + 1).padStart(2, '0') }}</div>
          <h3 class="mb-2.5 mt-3.5 text-xl font-medium tracking-[-0.02em]">{{ pick(card.label_ro, card.label_en, locale) }}</h3>
          <p class="m-0 text-base text-muted">{{ pick(card.body_ro, card.body_en, locale) }}</p>
        </div>
      </div>
    </div>

    <p class="mb-0 mt-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('home.services.note') }}</p>
  </SiteSection>
</template>
