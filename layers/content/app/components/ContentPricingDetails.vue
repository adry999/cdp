<script setup lang="ts">
import { faqPage } from '#layers/core/shared/utils/jsonLd'

const { t, te, tm, rt } = useI18n()

interface TextItem {
  title: string
  body: string
}
interface FaqItem {
  question: string
  answer: string
}

// `tm` returns the raw message tree; `rt` resolves each leaf.
const included = computed<TextItem[]>(() =>
  (tm('pricing.included.items') as TextItem[]).map((item) => ({
    title: rt(item.title),
    body: rt(item.body),
  })),
)
const faq = computed<FaqItem[]>(() =>
  (tm('pricing.faq.items') as FaqItem[]).map((item) => ({
    question: rt(item.question),
    answer: rt(item.answer),
  })),
)
useJsonLd(() => (faq.value.length ? faqPage(faq.value) : null))

// A plan shows its price only once `pricing.afterLaunch.plans.<id>.price` exists in the locale files.
const PLAN_IDS = ['maintenance', 'continuous'] as const
</script>

<template>
  <div>
    <SiteSection :label="t('pricing.included.label')">
      <div class="grid grid-fit-safe-240 gap-x-6 gap-y-8">
        <div v-for="item in included" :key="item.title">
          <h3 class="m-0 text-lg font-medium tracking-[-0.02em]">{{ item.title }}</h3>
          <p class="m-0 mt-2.5 text-[15px] text-muted">{{ item.body }}</p>
        </div>
      </div>
    </SiteSection>

    <SiteSection :label="t('pricing.afterLaunch.label')">
      <h2 class="m-0 max-w-[28ch] heading-section">
        {{ t('pricing.afterLaunch.title') }}
      </h2>
      <div class="mt-7 grid grid-fit-safe-280 gap-4">
        <div v-for="id in PLAN_IDS" :key="id" class="rounded border border-hairline p-6">
          <div class="eyebrow text-muted">
            {{ t(`pricing.afterLaunch.plans.${id}.label`) }}
          </div>
          <div
            v-if="te(`pricing.afterLaunch.plans.${id}.price`)"
            class="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
            {{ t(`pricing.afterLaunch.plans.${id}.price`) }}
          </div>
          <p class="m-0 mt-2.5 text-[15px] text-muted">{{ t(`pricing.afterLaunch.plans.${id}.body`) }}</p>
        </div>
      </div>
      <p class="m-0 mt-6 max-w-[68ch] text-sm text-muted">{{ t('pricing.afterLaunch.warrantyNote') }}</p>
    </SiteSection>

    <SiteSection :label="t('pricing.faq.label')">
      <FaqList :items="faq" />
    </SiteSection>
  </div>
</template>
