<script setup lang="ts">
// Section 02 — "Stack". Four capability groups laid out as a responsive 2×2 card
// grid, each card pairing a one-line business benefit with its tech pills. All
// copy comes from useStackGroups(), which reads the `home.stack` i18n block —
// nothing is hardcoded here or in app/types/stack.ts. The DB `stack_groups`
// table still exists but no longer feeds this section (same split as the
// services timeline).

const { t } = useI18n()
const groups = useStackGroups()

// Benefit copy is authored as "Lead: sentence." — show the lead in ink and the
// rest muted. Split once here rather than three times in the template.
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
    <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.stack.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ t('home.stack.subtitle') }}</p>

    <div class="mt-[clamp(28px,3vw,40px)] grid grid-cols-1 gap-6 md:grid-cols-2">
      <article
        v-for="card in cards"
        :key="card.id"
        class="flex flex-col rounded border border-hairline bg-paper p-[clamp(20px,2.5vw,28px)] transition-colors duration-200 hover:border-muted-ink"
      >
        <header class="flex items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-hairline text-signal">
            <StackGroupIcon :name="card.icon" />
          </span>
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
