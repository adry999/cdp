<script setup lang="ts">
defineProps<{
  number: string
  label: string
  heading: string
  paragraphs?: string[]
  empty?: boolean
  placeholder: string
}>()
const { t } = useI18n()
</script>

<template>
  <SiteSection :number="number" :label="label" padding="md">
    <h2 class="m-0 max-w-[28ch] heading-section">
      {{ heading }}
    </h2>
    <p v-for="paragraph in paragraphs" :key="paragraph" class="mt-5 max-w-[64ch] text-[17px] text-muted">
      {{ paragraph }}
    </p>
    <div v-if="empty" class="mt-6 flex max-w-[64ch] flex-col gap-1.5 rounded border border-dashed border-rule px-5 py-[18px]">
      <span class="eyebrow-sm text-signal">{{ t('caseStudy.toComplete') }}</span>
      <span class="text-base text-muted">{{ placeholder }}</span>
    </div>
    <slot />
  </SiteSection>
</template>
