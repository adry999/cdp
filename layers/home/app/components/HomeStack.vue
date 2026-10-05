<script setup lang="ts">
import { useStackGroups } from '#layers/content'

const { t } = useI18n()
const groups = useStackGroups()

// Benefit copy is "Lead: sentence." — lead in ink, rest muted.
const cards = computed(() =>
  groups.value.map((group) => {
    const at = group.benefit.indexOf(': ')
    return {
      ...group,
      lead: at === -1 ? '' : group.benefit.slice(0, at),
      body: at === -1 ? group.benefit : group.benefit.slice(at + 2),
    }
  }),
)
</script>

<template>
  <SiteSection number="02" :label="t('home.stack.sectionLabel')" section-id="stack">
    <h2 class="m-0 max-w-[28ch] heading-section">
      {{ t('home.stack.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ t('home.stack.subtitle') }}</p>

    <div class="mt-[clamp(28px,3vw,40px)] grid grid-cols-1 gap-6 md:grid-cols-2">
      <article
        v-for="card in cards"
        :key="card.id"
        class="flex flex-col rounded border border-hairline bg-paper p-[clamp(20px,2.5vw,28px)] transition-colors duration-200 hover:border-muted-ink"
      >
        <header class="flex items-center">
          <h3 class="m-0 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted">
            {{ card.name }}
          </h3>
        </header>

        <p class="mb-0 mt-4 flex-1 text-[15px] leading-relaxed text-muted">
          <span v-if="card.lead" class="font-medium text-ink">{{ card.lead }}. </span>{{ card.body }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <TechChip v-for="tag in card.tags" :key="tag" :label="tag" />
        </div>
      </article>
    </div>

    <p class="mb-0 mt-[clamp(20px,2.5vw,28px)] max-w-[62ch] text-sm text-muted">
      {{ t('home.stack.integrationNote') }}
    </p>
  </SiteSection>
</template>
