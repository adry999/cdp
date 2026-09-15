<script setup lang="ts">
import { useFaqs } from '#layers/content'

const { t } = useI18n()
const items = useFaqs()
</script>

<template>
  <SiteSection v-if="items.length" number="06" :label="t('home.faq.sectionLabel')" section-id="faq">
    <div class="flex flex-col">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="flex flex-wrap gap-[clamp(16px,3vw,40px)] border-t border-hairline py-[clamp(20px,2.5vw,28px)]"
        :class="{ 'border-b': i === items.length - 1 }"
      >
        <h3 class="m-0 flex-[0_0_240px] text-[19px] font-medium tracking-[-0.02em]">
          {{ item.question }}
        </h3>
        <p class="m-0 max-w-[60ch] flex-[1_1_320px] text-base text-muted">
          {{ item.answer }}
        </p>
      </div>
    </div>
  </SiteSection>
</template>
