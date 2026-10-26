<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

const props = defineProps<{ service: Service; number?: string }>()
const { t, locale } = useI18n()

const items = computed(() =>
  (props.service.faq ?? []).map((entry) => ({
    question: pick(entry.question.ro, entry.question.en, locale.value),
    answer: pick(entry.answer.ro, entry.answer.en, locale.value),
  })),
)
</script>

<template>
  <SiteSection v-if="items.length" :number="number ?? '05'" :label="t('home.faq.sectionLabel')" section-id="faq">
    <h2 class="sr-only">{{ t('home.faq.sectionLabel') }}</h2>
    <FaqList :items="items" />
  </SiteSection>
</template>

