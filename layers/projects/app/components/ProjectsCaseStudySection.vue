<script setup lang="ts">
defineProps<{
  number: string
  label: string
  heading?: string
  sectionId?: string
}>()
</script>

<template>
  <SiteSection :number="number" :label="label" :section-id="sectionId" padding="md">
    <h2 v-if="heading" class="m-0 max-w-[28ch] heading-section text-pretty">
      {{ heading }}
    </h2>
    <slot />
  </SiteSection>
</template>
