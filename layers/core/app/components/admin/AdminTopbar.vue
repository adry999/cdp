<script setup lang="ts">
const props = defineProps<{ title: string; back?: { to: string; label: string } }>()

// Every admin screen has a topbar, so its title also names the browser tab ("Proiecte · CODEPEDIA").
useHead({ title: () => props.title })
</script>

<template>
  <!-- Sticky: the save button and its status stay in reach on long editors. On a narrow screen the
       actions wrap under the title instead of pushing the bar past the screen's edge. -->
  <div
    class="sticky top-0 z-10 flex min-h-16 flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-hairline bg-paper px-6 py-1.5"
  >
    <!-- Grows from 8rem: the title shares the line with the actions and is cut first; only when even
         8rem doesn't fit do the actions wrap under it. -->
    <div class="flex min-w-0 flex-[1_1_8rem] items-center gap-4">
      <NuxtLink
        v-if="back"
        :to="back.to"
        class="flex-none eyebrow text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← {{ back.label }}
      </NuxtLink>
      <!-- A long project title is cut, not pushed past the screen's edge; the tooltip has it whole. -->
      <h1 class="m-0 min-w-0 truncate text-lg font-medium tracking-[-0.02em]" :title="title">{{ title }}</h1>
    </div>
    <div class="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <slot name="actions" />
    </div>
  </div>
</template>
