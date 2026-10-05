<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'
import { useSiteSettings } from '#layers/content'

const { t } = useI18n()
const settings = useSiteSettings()
const { isQualifierEnabled } = useQualifierAvailability()

// Email/phone are never rendered into the markup, not even as mailto:/tel: hrefs, so
// scrapers get nothing; visitors go through the qualification modal or the fallback form.
const showForm = ref(false)
</script>

<template>
  <SiteSection number="07" :label="t('home.contact.sectionLabel')" section-id="contact">
    <h2 class="m-0 max-w-[22ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.025em]">
      {{ t('home.contact.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-lead text-muted">
      {{ t('home.contact.lead') }}
    </p>

    <div class="mt-[clamp(28px,3vw,44px)] grid max-w-[560px] grid-fit-180 gap-4">
      <FactCard :label="t('home.contact.facts.responseTime')" :value="settings.responseTime" />
      <FactCard :label="t('home.contact.facts.hours')" :value="settings.hours" />
    </div>

    <template v-if="isQualifierEnabled">
      <div class="mt-[clamp(28px,3vw,40px)] flex flex-wrap items-center gap-x-6 gap-y-3">
        <QualifierCta variant="signal">{{ t('qualifier.trigger') }}</QualifierCta>
        <button
          v-if="!showForm"
          type="button"
          class="eyebrow text-muted underline underline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          @click="showForm = true"
        >
          {{ t('home.contact.preferMessage') }}
        </button>
      </div>
      <LeadsContactForm v-if="showForm" />
    </template>

    <LeadsContactForm v-else />
  </SiteSection>
</template>
