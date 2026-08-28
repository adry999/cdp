<script setup lang="ts">
// Section 05 — "About". A boutique-studio positioning statement on the dark
// band: title + lead at the top, then the three agency guarantees as a
// responsive 3-up grid of value cards. All copy comes from useAboutPillars(),
// which reads the `home.about` i18n block — nothing is hardcoded here or in
// app/types/about.ts. Same public/DB split as the services timeline, the stack
// grid and the process tracks.

const { t } = useI18n()
const pillars = useAboutPillars()
</script>

<template>
  <SiteSection number="05" :label="t('home.about.sectionLabel')" inverted padding="ink">
    <h2 class="m-0 max-w-[24ch] text-[clamp(26px,3.4vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">
      {{ t('home.about.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] leading-relaxed text-body-ink">
      {{ t('home.about.lead') }}
    </p>

    <div class="mt-[clamp(32px,4vw,52px)] grid grid-cols-1 gap-6 md:grid-cols-3">
      <article
        v-for="pillar in pillars"
        :key="pillar.id"
        class="flex flex-col rounded border border-hairline-ink bg-paper/[0.03] p-[clamp(20px,2.5vw,26px)] transition-colors duration-200 hover:border-muted-ink"
      >
        <span class="font-mono text-xs tracking-[0.14em] text-signal">{{ pillar.index }}</span>
        <h3 class="mt-4 text-lg font-medium leading-snug tracking-[-0.02em]">
          {{ pillar.title }}
        </h3>
        <p class="mb-0 mt-3 text-[15px] leading-relaxed text-body-ink">
          {{ pillar.body }}
        </p>
      </article>
    </div>
  </SiteSection>
</template>
