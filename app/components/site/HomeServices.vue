<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { StageId } from '~/types/services'

// Section 01 — the "growth timeline". Five milestone nodes on an animated
// connector line (horizontal ≥768px, vertical below) that mirror the qualifier
// modal's stages. Clicking a node expands a detail card; its CTA opens the
// qualifier pre-set to that stage. All copy comes from useServiceStages(); no
// figure is hardcoded here (see app/types/services.ts).
//
// The connector is drawn with CSS transforms, not an SVG-path library — the
// project ships no animation dependency and Framer Motion is React-only.

const { t } = useI18n()
const { open: openQualifier, enabled: qualifierEnabled } = useQualifier()
const stages = useServiceStages()

const active = ref(0)
const mounted = ref(false)
const drawn = ref(false)

const timelineEl = ref<HTMLElement | null>(null)
const nodeEls = ref<HTMLButtonElement[]>([])

function setNodeRef(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLButtonElement) nodeEls.value[i] = el
}

function select(i: number) {
  active.value = i
}

function onKeydown(event: KeyboardEvent) {
  const n = stages.value.length
  let next = active.value
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (active.value + 1) % n
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (active.value - 1 + n) % n
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = n - 1
      break
    default:
      return
  }
  event.preventDefault()
  select(next)
  nextTick(() => nodeEls.value[next]?.focus())
}

function startAt(id: StageId) {
  if (qualifierEnabled.value) {
    openQualifier(id)
    return
  }
  // Flag off → the modal isn't mounted anywhere; fall back to the contact
  // section (scroll-behavior in main.css already respects reduced motion).
  document.getElementById('contact')?.scrollIntoView()
}

onMounted(() => {
  mounted.value = true
  const el = timelineEl.value
  if (!el || typeof IntersectionObserver === 'undefined') {
    drawn.value = true
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          drawn.value = true
          io.disconnect()
          break
        }
      }
    },
    { threshold: 0.3 },
  )
  io.observe(el)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <SiteSection number="01" :label="t('home.services.sectionLabel')" section-id="servicii">
    <h2 class="m-0 max-w-[26ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.services.title') }}
    </h2>
    <p class="mb-0 mt-4 max-w-[60ch] text-base text-muted">{{ t('home.services.intro') }}</p>

    <div
      ref="timelineEl"
      role="tablist"
      :aria-label="t('home.services.title')"
      class="timeline relative mt-[clamp(28px,3.5vw,44px)] flex flex-col md:flex-row md:gap-2"
      :class="{ js: mounted, 'is-drawn': drawn }"
      @keydown="onKeydown"
    >
      <button
        v-for="(stage, idx) in stages"
        :id="`svc-tab-${stage.id}`"
        :ref="(el) => setNodeRef(el, idx)"
        :key="stage.id"
        type="button"
        role="tab"
        :aria-selected="idx === active"
        :aria-controls="`svc-panel-${stage.id}`"
        :tabindex="idx === active ? 0 : -1"
        :aria-label="t('home.services.timeline.nodeLabel', { step: idx + 1, label: stage.stageLabel })"
        class="node relative flex min-h-[76px] cursor-pointer items-center gap-4 rounded text-left md:min-h-0 md:flex-1 md:flex-col md:gap-3 md:pb-2 md:text-center"
        @click="select(idx)"
      >
        <span
          v-if="idx > 0"
          aria-hidden="true"
          class="seg bg-hairline"
          :style="{ transitionDelay: drawn ? `${idx * 70}ms` : '0ms' }"
        />
        <span
          class="dot relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-paper transition duration-200"
          :class="idx === active ? 'scale-[1.15] border-signal text-signal' : 'border-hairline text-muted'"
        >
          <QualifierStageIcon :name="stage.icon" />
        </span>
        <span class="flex min-w-0 flex-col gap-0.5 md:items-center">
          <span
            class="font-mono text-[11px] tabular-nums tracking-[0.08em]"
            :class="idx === active ? 'text-signal' : 'text-muted-ink'"
          >
            {{ String(idx + 1).padStart(2, '0') }}
          </span>
          <span
            class="text-[15px] font-medium leading-tight md:text-[13px]"
            :class="idx === active ? 'text-ink' : 'text-muted'"
          >
            {{ stage.stageLabel }}
          </span>
        </span>
      </button>
    </div>

    <Transition name="svc-panel" mode="out-in">
      <div
        :id="`svc-panel-${stages[active].id}`"
        :key="stages[active].id"
        role="tabpanel"
        :aria-labelledby="`svc-tab-${stages[active].id}`"
        tabindex="0"
        class="mt-[clamp(24px,3vw,36px)] rounded border border-hairline p-[clamp(20px,2.5vw,28px)]"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <span class="font-mono text-xs uppercase tracking-[0.08em] text-signal">{{ stages[active].stageLabel }}</span>
          <span class="font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ stages[active].priceOrTime }}</span>
        </div>
        <h3 class="mb-1 mt-4 text-xl font-medium tracking-[-0.02em]">{{ stages[active].title }}</h3>

        <div class="mt-4 flex flex-col">
          <TableRow :label="t('home.services.timeline.clientStage')" label-width="150px">
            <p class="m-0 max-w-[58ch] text-base text-muted">{{ stages[active].clientReality }}</p>
          </TableRow>
          <TableRow :label="t('home.services.timeline.whatYouGet')" label-width="150px" :last="true">
            <p class="m-0 max-w-[58ch] text-base">{{ stages[active].delivery }}</p>
          </TableRow>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <TechChip v-for="badge in stages[active].badges" :key="badge" :label="badge" />
        </div>

        <div class="mt-6">
          <AppButton variant="signal" @click="startAt(stages[active].id)">
            {{ t('home.services.timeline.cta') }}
          </AppButton>
        </div>
      </div>
    </Transition>

    <p class="mb-0 mt-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">{{ t('home.services.note') }}</p>
  </SiteSection>
</template>

<style scoped>
/* Connector segment: links the previous node's dot centre to this node's. It is
   a static hairline (the stages aren't a sequence, so it never fills) — this
   only owns geometry + the one-time draw-in. Vertical by default, horizontal
   from the md breakpoint up.

   21px = half the 44px dot (h-11/w-11) minus half the 2px line, so the segment
   sits dead-centre on the dots in both orientations. The dots carry no offset
   padding on either axis, so this stays true; selecting a dot scales it about
   its own centre and does not move that centre. */
.seg {
  position: absolute;
  left: 21px;
  top: -50%;
  width: 2px;
  height: 100%;
  transform-origin: top;
}

@media (min-width: 768px) {
  .seg {
    left: -50%;
    top: 21px;
    width: 100%;
    height: 2px;
    transform-origin: left;
  }
}

/* Draw-in only runs once JS is mounted and the timeline has scrolled into view,
   so the line is always visible without JavaScript. */
.timeline.js .seg {
  transform: scale(0);
}

.timeline.js.is-drawn .seg {
  transform: scale(1);
  transition: transform 0.45s ease;
}

.svc-panel-enter-active,
.svc-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.svc-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.svc-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .timeline.js .seg,
  .timeline.js.is-drawn .seg {
    transform: scale(1);
    transition: none;
  }

  .svc-panel-enter-active,
  .svc-panel-leave-active {
    transition: opacity 0.12s ease;
  }

  .svc-panel-enter-from,
  .svc-panel-leave-to {
    transform: none;
  }
}
</style>
