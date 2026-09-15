<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service }>()
const { locale } = useI18n()

const label = computed(() => pick('Ce include', 'What’s included', locale.value))
</script>

<template>
  <SiteSection number="01" :label="label">
    <ul class="m-0 flex list-none flex-col gap-4 p-0">
      <li v-for="(feature, i) in service.features" :key="i" class="flex gap-3 text-base text-muted">
        <span class="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
        <span>{{ pick(feature.ro, feature.en, locale) }}</span>
      </li>
    </ul>
  </SiteSection>
</template>
