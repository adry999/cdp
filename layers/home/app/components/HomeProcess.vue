<script setup lang="ts">
import { useProcessTracks, type ProcessTrackId } from '#layers/content'

const { t } = useI18n()
const tracks = useProcessTracks()

const activeId = ref<ProcessTrackId>('fast')
const activeTrack = computed(() => tracks.value.find((tr) => tr.id === activeId.value) ?? tracks.value[0]!)

function onKeydown(event: KeyboardEvent) {
  const ids = tracks.value.map((tr) => tr.id)
  const next = nextTabIndex(event.key, ids.indexOf(activeId.value), ids.length, true)
  if (next === null) return
  event.preventDefault()
  activeId.value = ids[next]!
  nextTick(() => document.getElementById(`process-tab-${ids[next]}`)?.focus())
}
const { el: processEl, isVisible, hasMounted } = useReveal({ threshold: 0.1, once: false })
</script>

<template>
  <SiteSection number="03" :label="t('home.process.sectionLabel')" section-id="proces">
    <h2 class="m-0 max-w-[28ch] heading-section">
      {{ t('home.process.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[62ch] text-base text-muted">{{ t('home.process.subtitle') }}</p>

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
        class="rounded px-[clamp(12px,2.5vw,20px)] py-2 eyebrow transition-colors duration-150"
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

    <div ref="processEl" class="relative mt-[clamp(24px,3vw,36px)]">
      <Transition v-for="track in tracks" :key="track.id" name="process-panel">
        <div
          v-show="track.id === activeTrack.id"
          :id="`process-panel-${track.id}`"
          role="tabpanel"
          :aria-labelledby="`process-tab-${track.id}`"
          :tabindex="track.id === activeTrack.id ? 0 : -1"
          class="w-full transition-all"
          :class="[
            hasMounted && !isVisible ? 'opacity-0 translate-y-6' : 'opacity-100',
            hasMounted && isVisible ? 'duration-700 ease-out' : 'duration-300'
          ]"
        >
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="m-0 text-xl font-medium tracking-[-0.02em]">{{ track.name }}</h3>
            <span
              class="rounded-full border px-2 py-[3px] eyebrow-sm"
              :class="track.tone === 'signal' ? 'border-signal/40 text-ink' : 'border-hairline text-muted'"
            >
              {{ track.scope }}
            </span>
          </div>
          <p class="mb-0 mt-3 max-w-[60ch] text-base text-muted">{{ track.summary }}</p>

          <ol class="mt-[clamp(24px,3vw,32px)] flex flex-col">
            <li
              v-for="(step, i) in track.steps"
              :key="step.index"
              class="flex flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-2 border-t border-hairline py-[clamp(18px,2.5vw,26px)]"
              :class="{ 'border-b': i === track.steps.length - 1 }"
            >
              <span class="flex-[0_0_64px] font-mono text-xs tracking-[0.08em] text-ink">
                {{ step.index }}
              </span>
              <div class="flex min-w-0 flex-[1_1_340px] flex-wrap gap-x-[clamp(16px,3vw,40px)] gap-y-1">
                <h4 class="m-0 flex-[0_0_200px] text-lg font-medium tracking-[-0.02em]">
                  {{ step.title }}
                </h4>
                <p class="m-0 max-w-[60ch] flex-[1_1_280px] text-base text-muted">{{ step.body }}</p>
              </div>
            </li>
          </ol>
        </div>
      </Transition>
    </div>

    <p class="mb-0 mt-[clamp(20px,2.5vw,28px)] max-w-[68ch] text-sm text-muted">
      {{ t('home.process.disclaimer') }}
    </p>
  </SiteSection>
</template>

<style scoped>
/* Old panel hides instantly (no leave transition) so the two never overlap. */
.process-panel-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.process-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .process-panel-enter-active {
    transition: opacity 0.12s ease;
  }

  .process-panel-enter-from {
    transform: none;
  }
}
</style>
