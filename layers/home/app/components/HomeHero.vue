<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { chooseHeroVariant, parseHeroPreview, type HeroChoice } from '#layers/home/domain/heroVariant'

const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
// The admin's choice is read on the server, so the cached `/` carries it. If the read fails the hero falls back to the env variable.
const { data: settings } = await useFetch<{ heroVariant: HeroChoice | null }>('/api/home/settings', {
  key: 'home:settings',
  default: () => ({ heroVariant: null }),
})
// `?hero=` previews are applied after mount only: `/` is cached, so SSR output must not depend on the query.
const previewChoice = ref<HeroChoice>()
const heroVariant = computed(() =>
  chooseHeroVariant({
    preview: previewChoice.value,
    stored: settings.value?.heroVariant ?? null,
    env: config.public.heroBgVariant as string | undefined,
  }),
)
onMounted(() => {
  previewChoice.value = parseHeroPreview(route.query.hero)
})
// The rotating part of the h1. First entry is rendered verbatim on the server and
// is the animation's starting point on the client, so the h1 always carries real
// text for SEO and no-JS.
const phrases = useI18nList()('home.hero.titlePhrases')
const typed = ref(phrases[0] ?? '')
// Each word is kept whole so narrow screens never split "page-uri" or "Site-uri" at the hyphen.
const typedWords = computed(() => typed.value.split(' '))

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
            ><template v-for="(word, i) in typedWords" :key="i"
              >{{ i > 0 ? ' ' : '' }}<span class="whitespace-nowrap"
                >{{ word }}<span v-if="i === typedWords.length - 1" class="hero-caret bg-signal" aria-hidden="true" /></span
            ></template
          ></span>
        </span>
        <span class="block max-sm:mt-[0.12em]">{{ t('home.hero.titleSuffix') }}</span>
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
      <div class="grid grid-fit-safe-320 gap-4">
        <FactCard :label="t('home.hero.facts.location')">
          <div>
            <div>{{ t('home.hero.facts.locationValue') }}</div>
            <div class="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-muted">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              <span>{{ t('home.hero.facts.itPark') }}</span>
              <CoreInfoTip size="sm" :label="t('home.hero.facts.itParkTooltipAria')">
                {{ t('home.hero.facts.itParkTooltip') }}
              </CoreInfoTip>
            </div>
          </div>
        </FactCard>
        <FactCard :label="t('home.hero.facts.markets')" :value="t('home.hero.facts.marketsValue')" />
        <FactCard
          class="col-span-full"
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
