<script setup lang="ts">
import type { Service } from '#layers/services/domain/service'

defineProps<{ service: Service }>()
const { t, locale } = useI18n()
</script>

<template>
  <section id="top" class="scroll-mt-16">
    <div
      class="mx-auto flex max-w-[1280px] flex-wrap gap-[clamp(24px,4vw,48px)] px-gutter pb-[clamp(40px,5vw,72px)] pt-[clamp(48px,8vw,120px)]"
    >
      <div class="flex-[0_0_160px]">
        <SectionLabel number="00" :label="t('home.services.sectionLabel')" />
      </div>
      <div class="min-w-0 flex-[1_1_560px]">
        <h1
          class="m-0 max-w-[20ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[1.04] tracking-[-0.025em]"
          style="text-wrap: pretty"
        >
          {{ pick(service.name.ro, service.name.en, locale) }}
        </h1>
        <p class="mt-[clamp(20px,2.6vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-muted">
          {{ pick(service.intro.ro, service.intro.en, locale) }}
        </p>
      </div>
    </div>
  </section>
</template>
