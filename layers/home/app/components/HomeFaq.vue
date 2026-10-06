<script setup lang="ts">
import { useFaqs } from '#layers/content'
import { faqPage } from '#layers/core/shared/utils/jsonLd'

const { t } = useI18n()
const items = useFaqs()

useJsonLd(() => (items.value.length ? faqPage(items.value) : null))
</script>

<template>
  <SiteSection v-if="items.length" number="06" :label="t('home.faq.sectionLabel')" section-id="faq">
    <h2 class="sr-only">{{ t('home.faq.sectionLabel') }}</h2>
    <FaqList :items="items" />
  </SiteSection>
</template>
