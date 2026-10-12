<script setup lang="ts">
import { useContactModal } from '#layers/leads/state/useContactModal'

// The modal's code loads on the first open request, not with the page.
const { isOpen } = useContactModal()
const requested = ref(isOpen.value)
watch(isOpen, (open) => {
  if (open) requested.value = true
})
</script>

<template>
  <LazyLeadsContactModal v-if="requested" />
</template>
