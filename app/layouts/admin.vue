<script setup lang="ts">
// Admin is excluded from i18n (`i18n: false` on each admin page) and never
// linked from public pages, but crawlers can still reach it directly —
// keep it out of search results.
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="flex min-h-screen">
    <AdminSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>
