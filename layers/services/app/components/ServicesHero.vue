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
  >
    <div v-if="service.audience" class="mt-6 flex flex-wrap items-center gap-2">
      <span class="mr-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{{ t('services.hero.audienceLabel') }}</span>
      <TechChip v-for="(entry, i) in service.audience" :key="i" :label="pick(entry.ro, entry.en, locale)" />
    </div>
  </PageHero>
</template>
