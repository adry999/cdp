<script setup lang="ts">
// Default slot renders below the intro.
// `plain` drops the dot-matrix background (service pages follow the flat prototype hero).
withDefaults(
  defineProps<{
    number: string
    label: string
    title: string
    intro: string
    plain?: boolean
    padding?: 'hero' | 'heroBlog'
  }>(),
  { plain: false, padding: 'hero' },
)
</script>

<template>
  <SiteSection section-id="top" :number="number" :label="label" :padding="padding" :top-border="false">
    <template v-if="!plain" #background>
      <CoreInteractiveBackground variant="dot-matrix" />
    </template>
    <h1
      class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em] text-pretty"
    >
      {{ title }}
    </h1>
    <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-lead text-muted">
      {{ intro }}
    </p>
    <slot />
  </SiteSection>
</template>
