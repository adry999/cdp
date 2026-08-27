<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const { t, tm, rt } = useI18n()

// The rotating part of the h1. First entry is rendered verbatim on the server and
// is the animation's starting point on the client, so the h1 always carries real
// text for SEO and no-JS.
const phrases = (tm('home.hero.titlePhrases') as unknown[]).map((entry) => rt(entry as string))
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
  <section id="top" class="scroll-mt-16">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,8vw,120px)]"
    >
      <div class="flex-[0_0_160px]">
        <SectionLabel number="00" :label="t('home.hero.sectionLabel')" />
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <h1
          class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em]"
          style="text-wrap: pretty"
        >
          <span class="grid min-h-[2.1em] items-end">
            <span class="font-mono font-medium tracking-normal"
              >{{ typed }}<span class="hero-caret bg-signal" aria-hidden="true"
            /></span>
          </span>
          <span class="block">{{ t('home.hero.titleSuffix') }}</span>
        </h1>
        <p
          class="mt-[clamp(20px,2.6vw,28px)] max-w-[42ch] text-[clamp(20px,2.2vw,26px)] font-medium leading-[1.2] tracking-[-0.02em] text-ink"
          style="text-wrap: pretty"
        >
          {{ t('home.hero.problem') }}
        </p>
        <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ t('home.hero.lead') }}
        </p>
        <div class="mt-[clamp(28px,3vw,40px)] flex flex-wrap gap-3">
          <AppButton href="#contact" variant="ink">{{ t('home.hero.ctaPrimary') }}</AppButton>
          <AppButton href="#proces" variant="outline">{{ t('home.hero.ctaSecondary') }}</AppButton>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-[1280px] px-gutter pb-[clamp(40px,5vw,64px)]">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <FactCard :label="t('home.hero.facts.location')" :value="t('home.hero.facts.locationValue')" />
        <FactCard :label="t('home.hero.facts.markets')" :value="t('home.hero.facts.marketsValue')" />
        <FactCard :label="t('home.hero.facts.stack')" :value="t('home.hero.facts.stackValue')" />
      </div>
    </div>
  </section>
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
