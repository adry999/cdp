<script setup lang="ts">
const props = defineProps<{ title: string; back?: { to: string; label: string } }>()

// Every admin screen has a topbar, so its title also names the browser tab ("Proiecte · CODEPEDIA").
useHead({ title: () => props.title })
</script>

<template>
  <!-- Sticky: the save button and its status stay in reach on long editors. -->
  <div class="sticky top-0 z-10 flex h-16 flex-none items-center justify-between border-b border-hairline bg-paper px-6">
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
