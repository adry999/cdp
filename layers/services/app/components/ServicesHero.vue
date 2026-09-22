<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service }>()
const { t, locale } = useI18n()
</script>

<template>
  <PageHero
    number="00"
    :label="t('home.services.sectionLabel')"
    :title="pick(service.name.ro, service.name.en, locale)"
    :intro="pick(service.intro.ro, service.intro.en, locale)"
  />
</template>
