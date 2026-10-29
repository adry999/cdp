<script setup lang="ts">
// Admin is excluded from i18n (`i18n: false` on each admin page) and never
// linked from public pages, but crawlers can still reach it directly —
// keep it out of search results.
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="flex min-h-screen flex-col nav:flex-row">
    <AdminSidebar />
    <main tabindex="-1" class="flex min-w-0 flex-1 flex-col outline-none">
      <slot />
    </main>
  </div>
</template>
