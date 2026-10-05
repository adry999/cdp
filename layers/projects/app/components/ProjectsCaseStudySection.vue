<script setup lang="ts">
defineProps<{
  number: string
  label: string
  heading: string
  paragraphs?: string[]
  /** Renders the "to complete" box when the section has no content of its own. */
  empty?: boolean
  placeholder: string
}>()
const { t } = useI18n()
</script>

<template>
  <SiteSection :number="number" :label="label" padding-y="clamp(40px,6vw,88px)">
    <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ heading }}
    </h2>
    <p v-for="paragraph in paragraphs" :key="paragraph" class="mt-5 max-w-[64ch] text-[17px] text-muted">
      {{ paragraph }}
    </p>
    <div v-if="empty" class="mt-6 flex max-w-[64ch] flex-col gap-1.5 rounded border border-dashed border-[var(--color-dashed)] px-5 py-[18px]">
      <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-signal">{{ t('caseStudy.toComplete') }}</span>
      <span class="text-base text-muted">{{ placeholder }}</span>
    </div>
    <slot />
  </SiteSection>
</template>
