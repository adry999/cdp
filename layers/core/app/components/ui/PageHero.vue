<script setup lang="ts">
/** The hero of a top-level page below the homepage: a section label in the
 * 160px column, a large h1 and an intro paragraph — first used by the
 * service pages, now shared with the portfolio index. */
defineProps<{
  number: string
  label: string
  title: string
  intro: string
}>()
</script>

<template>
  <section id="top" class="scroll-mt-16">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,8vw,120px)]"
    >
      <div class="flex-[0_0_160px]">
        <SectionLabel :number="number" :label="label" />
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <h1
          class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em]"
          style="text-wrap: pretty"
        >
          {{ title }}
        </h1>
        <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ intro }}
        </p>
      </div>
    </div>
  </section>
</template>
