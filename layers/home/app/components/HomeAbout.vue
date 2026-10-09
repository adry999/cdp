<script setup lang="ts">
import { useAboutPillars } from '#layers/content'

const { t } = useI18n()
const pillars = useAboutPillars()
const { el: gridEl, isVisible, hasMounted } = useReveal({ threshold: 0.1, once: false })
</script>

<template>
  <SiteSection number="05" :label="t('home.about.sectionLabel')" inverted padding="xl">
    <h2 class="m-0 max-w-[24ch] heading-display">
      {{ t('home.about.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[54ch] text-lead leading-relaxed text-body-ink">
      {{ t('home.about.lead') }}
    </p>

    <div ref="gridEl" class="mt-[clamp(32px,4vw,52px)] grid grid-cols-1 gap-6 md:grid-cols-3">
      <article
        v-for="(pillar, i) in pillars"
        :key="pillar.id"
        class="group flex flex-col rounded border border-white/20 bg-paper/[0.03] p-[clamp(20px,2.5vw,26px)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/50 hover:bg-paper/[0.06] hover:shadow-lg hover:shadow-signal/10"
        :class="[
          hasMounted && !isVisible ? 'opacity-0 translate-y-6' : 'opacity-100',
          hasMounted && isVisible ? 'duration-700 ease-out' : 'duration-300'
        ]"
        :style="{ transitionDelay: hasMounted && isVisible ? `${i * 120}ms` : '0ms' }"
      >
        <span class="font-mono text-xs tracking-[0.14em] text-signal">{{ pillar.index }}</span>
        <h3 class="mt-4 text-lg font-medium leading-snug tracking-[-0.02em] transition-colors duration-300 group-hover:text-paper">
          {{ pillar.title }}
        </h3>
        <p class="mb-0 mt-3 text-[15px] leading-relaxed text-body-ink transition-colors duration-300 group-hover:text-paper/90">
          {{ pillar.body }}
        </p>
      </article>
    </div>
  </SiteSection>
</template>
