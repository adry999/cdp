<script setup lang="ts">
// Invisible to people and skipped by keyboard and screen readers; bots fill
// every input, and the server treats a non-empty value as spam.
const value = defineModel<string>({ required: true })
</script>

<template>
  <input
    v-model="value"
    type="text"
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
    class="absolute -left-[9999px] h-0 w-0"
  >
</template>
