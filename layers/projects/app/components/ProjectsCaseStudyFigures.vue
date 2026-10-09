<script setup lang="ts">
defineProps<{ figures: { v: string; k: string }[] }>()
</script>

<template>
  <div class="grid grid-fit-safe-180 gap-4">
    <div v-for="(figure, i) in figures" :key="`${i}-${figure.k}`" class="border-t border-ink pt-4">
      <div class="text-[clamp(34px,4.4vw,56px)] font-semibold leading-none tracking-[-0.03em]">
        {{ figure.v }}
      </div>
      <div class="mt-[10px] eyebrow text-muted">
        {{ figure.k }}
      </div>
    </div>
  </div>
</template>
