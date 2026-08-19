<script setup lang="ts">
import type { HomeApiResponse } from '~/types/home'

const { t, locale } = useI18n()
const { data } = await useAsyncData<HomeApiResponse>('home', () => $fetch('/api/home'))
const settings = computed(() => data.value?.settings)
</script>

<template>
  <SiteSection number="07" :label="t('home.contact.sectionLabel')" section-id="contact">
    <h2 class="m-0 max-w-[22ch] text-[clamp(28px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.025em]">
      {{ t('home.contact.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[60ch] text-[clamp(16px,1.4vw,18px)] text-muted">
      {{ t('home.contact.lead') }}
    </p>
    <div v-if="settings" class="mt-[clamp(24px,3vw,36px)] flex flex-wrap gap-3">
      <AppButton :href="`mailto:${settings.contact_email}`" variant="signal">
        {{ settings.contact_email }}
      </AppButton>
      <AppButton v-if="settings.contact_phone" :href="`tel:${settings.contact_phone.replace(/\s/g, '')}`" variant="outline">
        {{ settings.contact_phone }}
      </AppButton>
    </div>
    <div v-if="settings" class="mt-[clamp(28px,3vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <FactCard
        :label="t('home.contact.facts.responseTime')"
        :value="pick(settings.response_time_ro ?? '', settings.response_time_en, locale)"
      />
      <FactCard :label="t('home.contact.facts.hours')" :value="settings.hours ?? ''" />
      <FactCard
        :label="t('home.contact.facts.nextOpening')"
        :value="pick(settings.next_opening_ro ?? '', settings.next_opening_en, locale)"
      />
    </div>
    <ContactForm />
  </SiteSection>
</template>
