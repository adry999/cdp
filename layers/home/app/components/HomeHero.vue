<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const { t } = useI18n()
const config = useRuntimeConfig()
const heroVariant = computed(() => {
  const v = (config.public.heroBgVariant as string) || 'dot-matrix'
  if (v === 'none' || v === 'false' || v === 'disabled') return null
  if (v === 'constellation' || v === 'light-orbs' || v === 'dot-matrix') return v
  return 'dot-matrix'
})
// The rotating part of the h1. First entry is rendered verbatim on the server and
// is the animation's starting point on the client, so the h1 always carries real
// text for SEO and no-JS.
const phrases = useI18nList()('home.hero.titlePhrases')
const typed = ref(phrases[0] ?? '')

if (import.meta.client && phrases.length > 1) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced) {
    const TYPE_MS = 55
    const DELETE_MS = 28
    const HOLD_MS = 1500
    const GAP_MS = 350

    let index = 0
    let char = (phrases[0] ?? '').length
    let deleting = true
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = phrases[index] ?? ''
      if (deleting) {
        char -= 1
        typed.value = current.slice(0, Math.max(char, 0))
        if (char <= 0) {
          deleting = false
          index = (index + 1) % phrases.length
          timer = setTimeout(tick, GAP_MS)
          return
        }
        timer = setTimeout(tick, DELETE_MS)
      } else {
        char += 1
        typed.value = current.slice(0, char)
        if (char >= current.length) {
          deleting = true
          timer = setTimeout(tick, HOLD_MS)
          return
        }
        timer = setTimeout(tick, TYPE_MS)
      }
    }

    timer = setTimeout(tick, HOLD_MS)
    onBeforeUnmount(() => clearTimeout(timer))
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <CoreInteractiveBackground v-if="heroVariant" :variant="heroVariant" />
    <div class="relative z-10">
      <SiteSection section-id="top" number="00" :label="t('home.hero.sectionLabel')" padding="heroCompact" :top-border="false">
      <h1 class="sr-only">{{ phrases[0] }} {{ t('home.hero.titleSuffix') }}</h1>
      <div
        class="m-0 max-w-[22ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em] text-pretty"
        aria-hidden="true"
      >
        <span class="grid min-h-[2.1em] items-end">
          <span class="font-mono font-medium tracking-normal"
            >{{ typed }}<span class="hero-caret bg-signal" aria-hidden="true"
          /></span>
        </span>
        <span class="block">{{ t('home.hero.titleSuffix') }}</span>
      </div>
      <p class="mt-[clamp(20px,2.4vw,28px)] max-w-[58ch] text-[clamp(17px,1.6vw,20px)] leading-[1.45] text-muted text-pretty">
        {{ t('home.hero.lead') }}
      </p>
      <div class="mt-[clamp(24px,2.8vw,36px)] flex flex-wrap gap-3">
        <QualifierCta variant="signal" fallback-href="#contact">{{ t('home.hero.ctaPrimary') }}</QualifierCta>
        <AppButton href="#proces" variant="outline">{{ t('home.hero.ctaSecondary') }}</AppButton>
      </div>
    </SiteSection>
    <div class="container-site pb-[clamp(36px,4.5vw,56px)]">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FactCard :label="t('home.hero.facts.location')">
          <div>
            <div>{{ t('home.hero.facts.locationValue') }}</div>
            <div class="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-muted">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              <span>{{ t('home.hero.facts.itPark') }}</span>
              <span class="group/tooltip relative inline-flex items-center">
                <button
                  type="button"
                  class="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-rule/70 text-[10px] font-mono font-medium text-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
                  :aria-label="t('home.hero.facts.itParkTooltipAria')"
                >
                  i
                </button>
                <span
                  role="tooltip"
                  class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(300px,85vw)] -translate-x-1/2 rounded border border-hairline bg-ink p-3 text-xs font-normal leading-relaxed text-paper shadow-lg opacity-0 transition-opacity duration-150 group-hover/tooltip:pointer-events-auto group-hover/tooltip:opacity-100 group-focus-within/tooltip:pointer-events-auto group-focus-within/tooltip:opacity-100"
                >
                  {{ t('home.hero.facts.itParkTooltip') }}
                  <span class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" aria-hidden="true" />
                </span>
              </span>
            </div>
          </div>
        </FactCard>
        <FactCard :label="t('home.hero.facts.markets')" :value="t('home.hero.facts.marketsValue')" />
        <FactCard
          class="md:col-span-2"
          :label="t('home.hero.facts.stack')"
          :value="t('home.hero.facts.stackValue')"
        />
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.hero-caret {
  display: inline-block;
  width: 0.07em;
  height: 0.8em;
  margin-left: 0.08em;
  vertical-align: -0.06em;
  animation: hero-caret-blink 1.05s step-end infinite;
}

@keyframes hero-caret-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-caret {
    animation: none;
  }
}
</style>
