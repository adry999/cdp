<script setup lang="ts">
const { t } = useI18n()

const steps = [
  { letter: 'S', key: 'situation' },
  { letter: 'T', key: 'task' },
  { letter: 'A', key: 'action' },
  { letter: 'R', key: 'result' },
] as const
</script>

<template>
  <section class="border-t border-hairline bg-hatch">
    <div class="container-site grid grid-fit-safe-200 gap-x-6 gap-y-3 py-5 eyebrow text-muted">
      <span v-for="step in steps" :key="step.letter">
        <span class="text-signal-text">{{ step.letter }}</span> · {{ t(`caseStudy.star.${step.key}`) }}
      </span>
    </div>
  </section>
</template>
