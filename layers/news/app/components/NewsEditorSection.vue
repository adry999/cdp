<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <section class="rounded border border-hairline p-6">
    <div class="eyebrow text-muted">{{ title }}</div>
    <div class="mt-4 flex flex-col gap-5">
      <slot />
    </div>
  </section>
</template>
