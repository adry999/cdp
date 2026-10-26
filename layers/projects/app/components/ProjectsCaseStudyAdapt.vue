<script setup lang="ts">
import type { CaseAdapt } from '#layers/projects/domain/star'

const props = defineProps<{ adapt: CaseAdapt }>()
const { t } = useI18n()

const columns = computed(() =>
  [
    { letter: 'M', caption: t('caseStudy.adapt.modules'), items: props.adapt.modules },
    { letter: 'I', caption: t('caseStudy.adapt.integrations'), items: props.adapt.integrations },
    { letter: 'S', caption: t('caseStudy.adapt.safety'), items: props.adapt.safety },
  ].filter((column) => column.items.length),
)
</script>

<template>
  <ProjectsCaseStudySection :label="t('caseStudy.sections.adapt.label')" :heading="adapt.heading || undefined">
    <p v-if="adapt.body" class="mt-5 max-w-[64ch] text-[17px] text-muted text-pretty">{{ adapt.body }}</p>
    <div v-if="columns.length" class="mt-[clamp(28px,3.5vw,44px)] grid grid-fit-safe-300 gap-[clamp(24px,3vw,40px)]">
      <div v-for="column in columns" :key="column.letter">
        <div class="eyebrow text-muted"><span class="text-signal-text">{{ column.letter }}</span> · {{ column.caption }}</div>
        <ul class="m-0 mt-3 list-none border-b border-hairline p-0">
          <li v-for="(item, i) in column.items" :key="`${i}-${item.k}`" class="flex flex-col gap-1 border-t border-hairline py-4">
            <span class="font-medium">{{ item.k }}</span>
            <span class="text-[15px] text-muted">{{ item.v }}</span>
          </li>
        </ul>
      </div>
    </div>
  </ProjectsCaseStudySection>
</template>
