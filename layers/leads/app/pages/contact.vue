<script setup lang="ts">
import { useSiteSettings } from '#layers/content'

const { t } = useI18n()
const settings = useSiteSettings()

const i18nList = useI18nList()
const steps = computed(() => i18nList('contactPage.steps'))

// The work email is never rendered into the markup (same rule as the homepage #contact
// section): visitors reach us through the form below.
usePageSeo({
  title: () => t('home.contact.seo.title'),
  description: () => t('home.contact.seo.description'),
})
useBreadcrumbLd(() => t('nav.contact'))
</script>

<template>
  <SiteSection number="—" :label="t('home.contact.sectionLabel')" padding="hero" :top-border="false">
    <template #background>
      <LazyCoreInteractiveBackground hydrate-on-idle variant="dot-matrix" />
    </template>
    <!-- One column: intro, form, then the steps and facts, so the form is on the first screen.
         From two 380px columns up (as wide as the old wrapping row): intro and aside | form. -->
    <div class="@container">
      <div
        class="grid gap-x-[clamp(32px,5vw,72px)] gap-y-9 [grid-template-areas:'intro'_'form'_'aside'] @min-[51rem]:grid-cols-2 @min-[51rem]:grid-rows-[auto_1fr] @min-[51rem]:[grid-template-areas:'intro_form'_'aside_form']"
      >
        <div class="min-w-0 [grid-area:intro]">
          <h1 class="m-0 max-w-[16ch] text-[clamp(34px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em]">
            {{ t('home.contact.title') }}
          </h1>
          <p class="m-0 mt-6 max-w-[46ch] text-lead text-muted">
            {{ t('home.contact.lead') }}
          </p>
        </div>
        <div class="min-w-0 [grid-area:form]">
          <LeadsContactForm />
        </div>
        <div class="min-w-0 [grid-area:aside]">
          <ol class="m-0 flex list-none flex-col border-b border-hairline p-0">
            <li v-for="(step, i) in steps" :key="step" class="flex gap-4 border-t border-hairline py-4">
              <span class="flex-[0_0_32px] font-mono text-xs text-signal-text">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="text-[15px]">{{ step }}</span>
            </li>
          </ol>
          <div class="mt-9 grid max-w-[560px] grid-fit-180 gap-4">
            <FactCard :label="t('home.contact.facts.responseTime')" :value="settings.responseTime" />
            <FactCard :label="t('home.contact.facts.phone')">
              <a :href="`tel:${settings.phone}`" class="text-ink no-underline hover:text-signal-text">{{ settings.phoneDisplay }}</a>
            </FactCard>
            <FactCard :label="t('home.contact.facts.email')" class="col-span-full">
              <a :href="`mailto:${settings.contactEmail}`" class="text-ink no-underline hover:text-signal-text">{{ settings.contactEmail }}</a>
            </FactCard>
          </div>
        </div>
      </div>
    </div>
  </SiteSection>
</template>
