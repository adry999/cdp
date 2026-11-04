<script setup lang="ts">
defineProps<{ title: string; back?: { to: string; label: string } }>()
</script>

<template>
  <div class="flex h-16 flex-none items-center justify-between border-b border-hairline px-6">
    <div class="flex items-center gap-4">
      <NuxtLink
        v-if="back"
        :to="back.to"
        class="eyebrow text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← {{ back.label }}
      </NuxtLink>
      <h1 class="m-0 text-lg font-medium tracking-[-0.02em]">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-4">
      <slot name="actions" />
    </div>
  </div>
</template>
