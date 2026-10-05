<script setup lang="ts">
/** The hero of a top-level page below the homepage: a section label in the
 * 160px column, a large h1 and an intro paragraph — first used by the
 * service pages, now shared with the portfolio index. The default slot
 * renders below the intro (used for the grants audience chips). */
defineProps<{
  number: string
  label: string
  title: string
  intro: string
}>()
</script>

<template>
  <SiteSection section-id="top" :number="number" :label="label" padding="hero" :top-border="false">
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
