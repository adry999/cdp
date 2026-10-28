<script setup lang="ts">
import { useQualifierAvailability } from '#layers/qualifier'
import { useSiteSettings } from '#layers/content'

const { t } = useI18n()
const settings = useSiteSettings()
const { isQualifierEnabled } = useQualifierAvailability()

// The email is never rendered into the markup, not even as a mailto: href, so scrapers get nothing;
// visitors go through the qualification modal, the fallback form or the public phone number.
const showForm = ref(false)

// The button that revealed the form is removed, so focus would fall to <body>. The form is lazy: wait for its first field.
async function revealForm() {
  showForm.value = true
  await nextTick()
  for (let i = 0; i < 20; i++) {
    const field = document.getElementById('lead-name')
    if (field) {
      field.focus()
      return
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}
</script>

<template>
  <SiteSection number="06" :label="t('home.contact.sectionLabel')" section-id="contact">
    <h2 class="m-0 max-w-[22ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.025em]">
      {{ t('home.contact.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-lead text-muted">
      {{ t('home.contact.lead') }}
    </p>

    <div class="mt-[clamp(28px,3vw,44px)] grid max-w-[560px] grid-fit-180 gap-4">
      <FactCard :label="t('home.contact.facts.responseTime')" :value="settings.responseTime" />
      <FactCard :label="t('home.contact.facts.phone')">
        <a :href="`tel:${settings.phone}`" class="text-ink no-underline hover:text-signal-text">{{ settings.phoneDisplay }}</a>
      </FactCard>
    </div>

    <template v-if="isQualifierEnabled">
      <div class="mt-[clamp(28px,3vw,40px)] flex flex-wrap items-center gap-x-6 gap-y-3">
        <QualifierCta variant="signal">{{ t('home.hero.ctaPrimary') }}</QualifierCta>
        <button
          v-if="!showForm"
          type="button"
          class="eyebrow text-muted underline underline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          @click="revealForm"
        >
          {{ t('home.contact.preferMessage') }}
        </button>
      </div>
      <LazyLeadsContactForm v-if="showForm" />
    </template>

    <LazyLeadsContactForm v-else />
  </SiteSection>
</template>
