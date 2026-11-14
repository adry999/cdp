<script setup lang="ts">
// A bordered arrow, 44px on phones and 32px from the nav breakpoint, for moving an item in an admin list (projects, gallery images). The
// caller names it with `aria-label` ("Mută X mai sus"): the arrow itself says nothing.
defineProps<{ direction: 'up' | 'down' | 'left' | 'right' }>()

const PATHS = {
  up: 'M2 6.5 5 3.5l3 3',
  down: 'M2 3.5 5 6.5l3-3',
  left: 'M6.5 2 3.5 5l3 3',
  right: 'M3.5 2 6.5 5l-3 3',
} as const
</script>

<template>
  <button
    type="button"
    class="flex size-11 flex-none cursor-pointer items-center justify-center rounded border border-muted nav:size-8 bg-transparent p-0 text-muted hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
  >
    <svg viewBox="0 0 10 10" class="size-2.5" aria-hidden="true">
      <path :d="PATHS[direction]" fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </button>
</template>
