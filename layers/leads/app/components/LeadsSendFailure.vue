<script setup lang="ts">
import { useSiteSettings } from '#layers/content'

// A send that failed on the server: what happened, and the address to write to instead. Shared
// with the qualifier's contact step, which may use leads but not content.
defineProps<{ message: string }>()

const settings = useSiteSettings()
</script>

<template>
  <div role="alert" class="flex flex-col gap-1 rounded border border-ink bg-hatch p-3 text-sm text-ink">
    <p class="m-0">{{ message }}</p>
    <a :href="`mailto:${settings.contactEmail}`" class="tap-y w-fit font-medium text-ink underline">{{ settings.contactEmail }}</a>
  </div>
</template>
