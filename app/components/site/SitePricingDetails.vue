<script setup lang="ts">
const { t, tm, rt } = useI18n()

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
const PLAN_IDS = ['maintenance', 'continuous'] as const
</script>

<template>
  <div>
    <SiteSection :label="t('pricing.included.label')">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-6 gap-y-8">
        <div v-for="item in included" :key="item.title">
          <h3 class="m-0 text-lg font-medium tracking-[-0.02em]">{{ item.title }}</h3>
          <p class="m-0 mt-2.5 text-[15px] text-muted">{{ item.body }}</p>
        </div>
      </div>
    </SiteSection>

    <SiteSection :label="t('pricing.afterLaunch.label')">
      <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
        {{ t('pricing.afterLaunch.title') }}
      </h2>
      <div class="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
        <div v-for="id in PLAN_IDS" :key="id" class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {{ t(`pricing.afterLaunch.plans.${id}.label`) }}
          </div>
          <div class="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
            {{ t(`pricing.afterLaunch.plans.${id}.price`) }}
          </div>
          <p class="m-0 mt-2.5 text-[15px] text-muted">{{ t(`pricing.afterLaunch.plans.${id}.body`) }}</p>
        </div>
      </div>
      <p class="m-0 mt-6 max-w-[68ch] text-sm text-muted">{{ t('pricing.afterLaunch.warrantyNote') }}</p>
    </SiteSection>

    <SiteSection :label="t('pricing.faq.label')">
      <div class="flex flex-col border-b border-hairline">
        <div
          v-for="item in faq"
          :key="item.question"
          class="flex flex-wrap gap-[clamp(16px,3vw,40px)] border-t border-hairline py-[clamp(20px,2.5vw,28px)]"
        >
          <h3 class="m-0 flex-[0_0_240px] text-[19px] font-medium tracking-[-0.02em]">{{ item.question }}</h3>
          <p class="m-0 max-w-[60ch] flex-[1_1_320px] text-base text-muted">{{ item.answer }}</p>
        </div>
      </div>
    </SiteSection>
  </div>
</template>
