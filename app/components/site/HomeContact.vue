<script setup lang="ts">
const { t, locale } = useI18n()
const { data } = await useHomeData()
const settings = computed(() => data.value?.settings)
const { enabled: qualifierEnabled, open: openQualifier } = useQualifier()

// The work email and phone number are deliberately never rendered into the
// markup — not as text, not as `mailto:` / `tel:` hrefs — so crawlers and
// cold-spam harvesters have nothing to scrape. Every visitor is routed through
// the qualification modal, or the inline message form as a fallback.
const showForm = ref(false)
</script>

<template>
  <SiteSection number="07" :label="t('home.contact.sectionLabel')" section-id="contact">
    <h2 class="m-0 max-w-[22ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.025em]">
      {{ t('home.contact.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-[clamp(16px,1.4vw,18px)] text-muted">
      {{ t('home.contact.lead') }}
    </p>

    <div v-if="settings" class="mt-[clamp(28px,3vw,44px)] grid max-w-[560px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <FactCard
        :label="t('home.contact.facts.responseTime')"
        :value="pick(settings.response_time_ro ?? '', settings.response_time_en, locale)"
      />
      <FactCard :label="t('home.contact.facts.hours')" :value="settings.hours ?? ''" />
    </div>

    <template v-if="qualifierEnabled">
      <div class="mt-[clamp(28px,3vw,40px)] flex flex-wrap items-center gap-x-6 gap-y-3">
        <AppButton variant="ink" @click="openQualifier">{{ t('qualifier.trigger') }}</AppButton>
        <button
          v-if="!showForm"
          type="button"
          class="font-mono text-xs uppercase tracking-[0.08em] text-muted underline underline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          @click="showForm = true"
        >
          {{ t('home.contact.preferMessage') }}
        </button>
      </div>
      <ContactForm v-if="showForm" />
    </template>

    <ContactForm v-else />
  </SiteSection>
</template>
