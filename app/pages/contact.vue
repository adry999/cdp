<script setup lang="ts">
import { useSiteSettings } from '#layers/content'

const { t, tm, rt } = useI18n()
const settings = useSiteSettings()

const steps = computed(() => (tm('contactPage.steps') as string[]).map((step) => rt(step)))

// The work email is never rendered into the markup (same rule as the homepage #contact
// section): visitors reach us through the form below.
usePageSeo({
  title: () => t('home.contact.title'),
  description: () => t('home.contact.lead'),
})
</script>

<template>
  <SiteSection number="—" :label="t('home.contact.sectionLabel')" padding="hero" :top-border="false">
    <div class="flex flex-wrap gap-[clamp(32px,5vw,72px)]">
      <div class="min-w-0 flex-[1_1_380px]">
        <h1 class="m-0 max-w-[16ch] text-[clamp(34px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em]">
          {{ t('home.contact.title') }}
        </h1>
        <p class="m-0 mt-6 max-w-[46ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ t('home.contact.lead') }}
        </p>
        <ol class="m-0 mt-9 flex list-none flex-col border-b border-hairline p-0">
          <li v-for="(step, i) in steps" :key="step" class="flex gap-4 border-t border-hairline py-4">
            <span class="flex-[0_0_32px] font-mono text-xs text-signal">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="text-[15px]">{{ step }}</span>
          </li>
        </ol>
        <div class="mt-9 grid max-w-[560px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <FactCard :label="t('home.contact.facts.responseTime')" :value="settings.responseTime" />
          <FactCard :label="t('home.contact.facts.hours')" :value="settings.hours" />
        </div>
      </div>
      <div class="min-w-0 flex-[1_1_380px]">
        <LeadsContactForm />
      </div>
    </div>
  </SiteSection>
</template>
