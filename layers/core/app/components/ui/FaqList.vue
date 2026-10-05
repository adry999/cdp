<script setup lang="ts">
defineProps<{ items: { question: string; answer: string }[] }>()
</script>

<template>
  <RowList>
    <RowListItem v-for="item in items" :key="item.question" :title="item.question">{{ item.answer }}</RowListItem>
  </RowList>
</template>
