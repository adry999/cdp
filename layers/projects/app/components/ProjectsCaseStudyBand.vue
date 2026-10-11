<script setup lang="ts">
import type { CaseStudySectionFlags } from '#layers/projects/domain/caseStudySections'

const props = defineProps<{ sections: CaseStudySectionFlags }>()
const { t } = useI18n()

// S/T/A/R legend under the facts; a step whose section is hidden is left out too.
const steps = computed(() =>
  (
    [
      { letter: 'S', key: 'situation' },
      { letter: 'T', key: 'task' },
      { letter: 'A', key: 'action' },
      { letter: 'R', key: 'result' },
    ] as const
  ).filter((step) => props.sections[step.key]),
)
</script>

<template>
  <div v-if="steps.length" class="border-t border-hairline bg-hatch">
    <div class="container-site grid grid-fit-safe-200 gap-x-6 gap-y-3 py-5 eyebrow text-muted">
      <span v-for="step in steps" :key="step.letter">
        <span class="text-signal-text">{{ step.letter }}</span> · {{ t(`caseStudy.band.${step.key}`) }}
      </span>
    </div>
  </div>
</template>
