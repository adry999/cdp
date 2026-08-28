<script setup lang="ts">
import type { ProcessTrackId } from '~/types/process'

// Section 03 — "Process". A dual-track delivery model: a Fast-Track pipeline for
// Express builds and design-to-code, and a Deep Build pipeline for custom apps,
// refactoring and AI automations. A segmented toggle swaps between the two
// four-step pipelines (same tablist interaction as the services timeline). All
// copy comes from useProcessTracks(), which reads the `home.process` i18n block
// — nothing is hardcoded here or in app/types/process.ts. The DB `process_steps`
// table and /admin still exist but no longer feed this section (same split as
// the services timeline and the stack grid).

const { t } = useI18n()
const tracks = useProcessTracks()

const activeId = ref<ProcessTrackId>('fast')
const activeTrack = computed(() => tracks.value.find((tr) => tr.id === activeId.value) ?? tracks.value[0])

// Roving-tabindex arrow-key nav across the two toggle buttons, matching
// HomeServices. Home/End are redundant with only two tabs, so left/right only.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const ids = tracks.value.map((tr) => tr.id)
  const i = ids.indexOf(activeId.value)
  const next = event.key === 'ArrowRight' ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length
  activeId.value = ids[next]!
  nextTick(() => document.getElementById(`process-tab-${ids[next]}`)?.focus())
}
</script>

<template>
  <SiteSection number="03" :label="t('home.process.sectionLabel')" section-id="proces">
    <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.process.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ t('home.process.subtitle') }}</p>

    <!-- Track toggle -->
    <div
      role="tablist"
      :aria-label="t('home.process.trackLabel')"
      class="mt-[clamp(28px,3vw,40px)] inline-flex gap-1 rounded border border-hairline bg-hatch p-1"
      @keydown="onKeydown"
    >
      <button
        v-for="track in tracks"
        :id="`process-tab-${track.id}`"
        :key="track.id"
        type="button"
        role="tab"
        :aria-selected="track.id === activeId"
        :aria-controls="`process-panel-${track.id}`"
        :tabindex="track.id === activeId ? 0 : -1"
        class="rounded px-[clamp(12px,2.5vw,20px)] py-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors duration-150"
        :class="[
          track.id === activeId
            ? track.tone === 'signal'
              ? 'bg-signal text-paper'
              : 'bg-ink text-paper'
            : 'text-muted hover:text-ink',
        ]"
        @click="activeId = track.id"
      >
        {{ track.badge }}
      </button>
    </div>

    <Transition name="process-panel" mode="out-in">
      <div
        :id="`process-panel-${activeTrack.id}`"
        :key="activeTrack.id"
        role="tabpanel"
        :aria-labelledby="`process-tab-${activeTrack.id}`"
        tabindex="0"
        class="mt-[clamp(24px,3vw,36px)]"
      >
        <!-- Track header -->
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 class="m-0 text-xl font-medium tracking-[-0.02em]">{{ activeTrack.name }}</h3>
          <span
            class="rounded-full border px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em]"
            :class="
              activeTrack.tone === 'signal'
                ? 'border-signal/40 text-signal'
                : 'border-hairline text-muted'
            "
          >
            {{ activeTrack.scope }}
          </span>
        </div>
        <p class="mb-0 mt-3 max-w-[60ch] text-base text-muted">{{ activeTrack.summary }}</p>

        <!-- Step pipeline -->
        <ol class="mt-[clamp(24px,3vw,32px)] flex flex-col">
          <li
            v-for="(step, i) in activeTrack.steps"
            :key="step.index"
            class="flex flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-2 border-t border-hairline py-[clamp(18px,2.5vw,26px)]"
            :class="{ 'border-b': i === activeTrack.steps.length - 1 }"
          >
            <span
              class="flex-[0_0_64px] font-mono text-xs tracking-[0.08em]"
              :class="activeTrack.tone === 'signal' ? 'text-signal' : 'text-ink'"
            >
              {{ step.index }}
            </span>
            <div
              class="flex min-w-0 flex-[1_1_340px] flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-1"
            >
              <h4 class="m-0 flex-[0_0_200px] text-lg font-medium tracking-[-0.02em]">
                {{ step.title }}
              </h4>
              <p class="m-0 max-w-[60ch] flex-[1_1_280px] text-base text-muted">{{ step.body }}</p>
            </div>
          </li>
        </ol>
      </div>
    </Transition>

    <p class="mb-0 mt-[clamp(20px,2.5vw,28px)] max-w-[68ch] text-sm text-muted">
      {{ t('home.process.disclaimer') }}
    </p>
  </SiteSection>
</template>

<style scoped>
/* Panel swap — mirrors the .svc-panel transition in HomeServices so the two
   interactive sections feel like one system. */
.process-panel-enter-active,
.process-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.process-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.process-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .process-panel-enter-active,
  .process-panel-leave-active {
    transition: opacity 0.12s ease;
  }

  .process-panel-enter-from,
  .process-panel-leave-to {
    transform: none;
  }
}
</style>
