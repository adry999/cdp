<script setup lang="ts">
import { useFaqs } from '#layers/content'

const { t } = useI18n()
const items = useFaqs()
</script>

<template>
  <SiteSection v-if="items.length" number="06" :label="t('home.faq.sectionLabel')" section-id="faq">
    <h2 class="sr-only">{{ t('home.faq.sectionLabel') }}</h2>
    <FaqList :items="items" />
  </SiteSection>
</template>
