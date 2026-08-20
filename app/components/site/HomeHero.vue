<script setup lang="ts">
const { t } = useI18n()
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
          {{ t('home.hero.title') }}
        </h1>
        <p class="mt-[clamp(24px,3vw,32px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-muted">
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
