<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service }>()
const { t, locale } = useI18n()
</script>

<template>
  <SiteSection number="02" :label="t('home.process.sectionLabel')">
    <div class="flex flex-col">
      <div
        v-for="(step, i) in service.process"
        :key="i"
        class="flex flex-wrap gap-[clamp(16px,3vw,40px)] border-t border-hairline py-5"
        :class="{ 'border-b': i === service.process.length - 1 }"
      >
        <div class="flex-[0_0_80px] font-mono text-xs tracking-[0.08em] text-signal">
          {{ String(i + 1).padStart(2, '0') }}
        </div>
        <div class="flex min-w-0 flex-[1_1_340px] flex-wrap gap-[clamp(16px,3vw,40px)]">
          <h3 class="m-0 flex-[0_0_200px] text-[19px] font-medium tracking-[-0.02em]">
            {{ pick(step.title.ro, step.title.en, locale) }}
          </h3>
          <p class="m-0 max-w-[58ch] flex-[1_1_280px] text-base text-muted">
            {{ pick(step.body.ro, step.body.en, locale) }}
          </p>
        </div>
      </div>
    </div>
  </SiteSection>
</template>
