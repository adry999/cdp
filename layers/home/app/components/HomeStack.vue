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

const { el: sectionEl, isVisible: drawn, hasMounted: mounted } = useReveal({ once: true })
</script>

<template>
  <SiteSection number="03" :label="t('home.stack.sectionLabel')" section-id="stack">
    <h2 class="m-0 max-w-[28ch] heading-section">
      {{ t('home.stack.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ t('home.stack.subtitle') }}</p>

    <div ref="sectionEl" class="mt-[clamp(28px,3vw,40px)] grid grid-cols-1 gap-6 md:grid-cols-2">
      <article
        v-for="(card, i) in cards"
        :key="card.id"
        class="group @container flex flex-col rounded border bg-paper p-[clamp(20px,2.5vw,28px)] transition-all hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg hover:shadow-signal/5 motion-reduce:hover:translate-y-0"
        :class="[
          mounted && !drawn ? 'opacity-0 translate-y-6' : 'opacity-100',
          mounted && drawn ? 'duration-700 ease-out' : 'duration-300',
          drawn ? 'border-hairline' : 'border-transparent'
        ]"
        :style="{ transitionDelay: mounted && drawn ? `${i * 120}ms` : '0ms' }"
      >
        <header class="flex items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-hairline text-signal">
            <Icon :name="card.icon" class="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <h3 class="m-0 font-mono text-xs font-medium uppercase tracking-[0.08em] text-muted">
            {{ card.name }}
          </h3>
        </header>

        <p class="mb-0 mt-4 flex-1 text-[15px] leading-relaxed text-muted">
          <span v-if="card.lead" class="font-medium text-ink">{{ card.lead }}. </span>{{ card.body }}
        </p>

        <!-- Equal columns keep the logos aligned and avoid a lone chip on the last row. -->
        <div class="mt-5 grid grid-cols-1 gap-2 @min-[17rem]:grid-cols-2">
          <TechChip
            v-for="tag in card.tags"
            :key="tag"
            :label="tag"
            class="min-w-0"
          />
        </div>
      </article>
    </div>

    <p class="mb-0 mt-[clamp(20px,2.5vw,28px)] max-w-[62ch] text-sm text-muted">
      {{ t('home.stack.integrationNote') }}
    </p>
  </SiteSection>
</template>
