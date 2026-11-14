<script setup lang="ts">
import { SECTION_IDS, type CaseStudySectionFlags } from '#layers/projects/domain/caseStudySections'

// The S · T · A · R reading guide between "Date" and the first section (prototype: Studiu de caz.dc.html,
// section "STAR"). Lists only the steps this case study actually has, so a missing "Rezultat" is not
// promised; hidden when fewer than two remain. Each step links to its section.
const props = defineProps<{ sections: CaseStudySectionFlags }>()
const { t } = useI18n()

const STEPS = [
  { key: 'situation', letter: 'S' },
  { key: 'task', letter: 'T' },
  { key: 'action', letter: 'A' },
  { key: 'result', letter: 'R' },
] as const

const steps = computed(() => STEPS.filter((step) => props.sections[step.key]))
</script>

<template>
  <section v-if="steps.length >= 2" class="border-t border-hairline bg-hatch" :aria-label="t('caseStudy.star.label')">
    <!-- Phones: rows touch and each link fills a 44px row, so the hit areas never overlap (UX_LAWS, Fitts). -->
    <ul class="container-site m-0 grid list-none grid-fit-safe-200 gap-x-6 gap-y-0 py-3 eyebrow text-muted nav:gap-y-3 nav:py-5">
      <li v-for="step in steps" :key="step.key">
        <a :href="`#${SECTION_IDS[step.key]}`" class="tap-y flex min-h-11 items-center text-muted no-underline transition-colors hover:text-ink nav:inline nav:min-h-0">
          <span class="text-signal-text">{{ step.letter }}</span> · {{ t(`caseStudy.star.${step.key}`) }}
        </a>
      </li>
    </ul>
  </section>
</template>
