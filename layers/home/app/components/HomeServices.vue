<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { StageId } from '#layers/core/shared/types/service-stage'
import { useQualifierAvailability } from '#layers/qualifier'
import { useServiceStages } from '#layers/content'
import { SERVICE_LINKS } from '#layers/services'

// The connector line is drawn with CSS transforms rather than an SVG-path library —
// the project ships no animation dependency.

const { t, locale } = useI18n()
const i18nList = useI18nList()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()
const stages = useServiceStages()

const active = ref(0)
const activeStage = computed(() => stages.value[active.value]!)
// Stages B and C currently have no matching service page, so they render none.
function relatedServicesFor(stageId: StageId) {
  return SERVICE_LINKS.filter((service) => service.qualifierStage === stageId)
}
// The grants block links to the service page it summarises.
const grantsService = SERVICE_LINKS.find((service) => service.slug === 'granturi')
const grantsHref = computed(() =>
  grantsService ? localePath({ name: 'servicii-slug', params: { slug: grantsService.routeSlug[locale.value] } }) : undefined,
)
const grantSteps = computed(() => i18nList('home.services.grants.steps'))
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
  const next = nextTabIndex(event.key, active.value, stages.value.length)
  if (next === null) return
  event.preventDefault()
  select(next)
  nextTick(() => nodeEls.value[next]?.focus())
}

function startAt(id: StageId) {
  if (isQualifierEnabled.value) {
    nuxtApp.callHook('qualifier:open', { stage: id })
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
    <h2 class="m-0 max-w-[26ch] heading-section">
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
        :aria-labelledby="`svc-tab-${stage.id}-prefix svc-tab-${stage.id}-step svc-tab-${stage.id}-name`"
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
        />
        <span class="flex min-w-0 flex-col gap-0.5 md:items-center">
          <span :id="`svc-tab-${stage.id}-prefix`" class="sr-only">{{ t('home.services.stageWord') }}</span
          >{{ ' ' }}<span
            :id="`svc-tab-${stage.id}-step`"
            class="font-mono text-[11px] tabular-nums tracking-[0.08em]"
            :class="idx === active ? 'text-ink' : 'text-muted'"
          >
            {{ String(idx + 1).padStart(2, '0') }}
          </span
          >{{ ' ' }}<span
            :id="`svc-tab-${stage.id}-name`"
            class="text-[15px] font-medium leading-tight md:text-[13px]"
            :class="idx === active ? 'text-ink' : 'text-muted'"
          >
            {{ stage.name }}
          </span>
        </span>
      </button>
    </div>

    <div class="relative mt-[clamp(24px,3vw,36px)]">
      <Transition v-for="stage in stages" :key="stage.id" name="svc-panel">
        <div
          v-show="stage.id === activeStage.id"
          :id="`svc-panel-${stage.id}`"
          role="tabpanel"
          :aria-labelledby="`svc-tab-${stage.id}`"
          :tabindex="stage.id === activeStage.id ? 0 : -1"
          class="rounded border border-hairline p-[clamp(20px,2.5vw,28px)]"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <h3 class="m-0 flex items-center gap-2 font-mono text-[clamp(18px,2.2vw,22px)] font-medium uppercase leading-tight tracking-[0.04em] text-ink">
              <span aria-hidden="true" class="inline-block h-2 w-2 shrink-0 rounded-full bg-signal" />
              {{ stage.name }}
            </h3>
            <span class="eyebrow text-muted">{{ stage.priceTime }}</span>
          </div>

          <div class="mt-6 flex flex-col">
            <TableRow :label="t('home.services.whereYouAreLabel')">
              <p class="m-0 max-w-[58ch] text-base text-muted">{{ stage.whereYouAre }}</p>
            </TableRow>
            <TableRow :label="t('home.services.whatYouGetLabel')" :last="true">
              <p class="m-0 max-w-[58ch] text-base">{{ stage.whatYouGet }}</p>
            </TableRow>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <TechChip v-for="badge in stage.badges" :key="badge" :label="badge" />
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-5">
            <AppButton variant="signal" @click="startAt(stage.id)">
              {{ stage.cta }}
            </AppButton>
            <NuxtLink
              v-for="service in relatedServicesFor(stage.id)"
              :key="service.slug"
              :to="localePath({ name: 'servicii-slug', params: { slug: service.routeSlug[locale] } })"
              class="eyebrow text-muted hover:text-signal-text"
            >
              {{ pick(service.name.ro, service.name.en, locale) }} →
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>

    <p class="mb-0 mt-5 eyebrow text-muted">{{ t('home.services.note') }}</p>

    <div class="mt-[clamp(32px,4vw,48px)] flex flex-col gap-4 rounded border border-hairline bg-hatch p-[clamp(20px,2.5vw,28px)]">
      <span class="eyebrow text-muted">
        <span aria-hidden="true" class="text-signal">●</span> {{ t('home.services.grants.kicker') }}
      </span>
      <h3 class="m-0 max-w-[30ch] text-[clamp(20px,2.4vw,26px)] font-medium leading-[1.2] tracking-[-0.02em] text-pretty">
        {{ t('home.services.grants.title') }}
      </h3>
      <p class="m-0 max-w-[62ch] text-base text-muted text-pretty">{{ t('home.services.grants.body') }}</p>
      <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
        <li v-for="(step, i) in grantSteps" :key="i">
          <TechChip class="bg-paper">{{ String(i + 1).padStart(2, '0') }} {{ step }}</TechChip>
        </li>
      </ul>
      <div class="mt-1 flex flex-wrap items-center gap-5">
        <AppButton variant="ink" :href="grantsHref">{{ t('home.services.grants.cta') }}</AppButton>
        <NuxtLink
          :to="`${localePath('index')}#contact`"
          class="eyebrow text-muted hover:text-signal-text"
        >
          {{ t('home.services.grants.contact') }}
        </NuxtLink>
      </div>
    </div>
  </SiteSection>
</template>

<style scoped>
/* Connector segment linking dot centres. 21px = half the 44px dot minus half the 2px line, so
   it stays centred on the dots (which scale in place and never offset). */
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

.svc-panel-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.svc-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .timeline.js .seg,
  .timeline.js.is-drawn .seg {
    transform: scale(1);
    transition: none;
  }

  .svc-panel-enter-active {
    transition: opacity 0.12s ease;
  }

  .svc-panel-enter-from {
    transform: none;
  }
}
</style>
