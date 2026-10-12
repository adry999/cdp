<script setup lang="ts">
import { useQualifierDialog } from '#layers/qualifier/state/useQualifierDialog'

// The modal's code loads on the first open request, not with the page.
const { isOpen } = useQualifierDialog()
const requested = ref(isOpen.value)
watch(isOpen, (open) => {
  if (open) requested.value = true
})
</script>

<template>
  <LazyQualifierModal v-if="requested" />
</template>
