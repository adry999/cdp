<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
const localePath = useLocalePath()

// No `mailto:` here on purpose — the work email is never put into markup.
// The primary action is the qualification modal, with the homepage contact
// section as the fallback when the modal is disabled.
const { enabled: qualifierEnabled, open: openQualifier } = useQualifier()
</script>

<template>
  <SiteSection number="05" :label="t('caseStudy.sections.next')" padding-y="clamp(40px,6vw,88px)">
    <h2 class="m-0 max-w-[22ch] text-[clamp(26px,3.4vw,40px)] font-semibold leading-[1.1] tracking-[-0.025em]">
      {{ project.caseStudy.nextTitle }}
    </h2>
    <div class="mt-[clamp(20px,2.5vw,32px)] flex flex-wrap gap-3">
      <AppButton v-if="qualifierEnabled" variant="signal" @click="openQualifier">
        {{ t('qualifier.trigger') }}
      </AppButton>
      <AppButton v-else :href="`${localePath('index')}#contact`" variant="signal">
        {{ t('qualifier.trigger') }}
      </AppButton>
      <AppButton :href="`${localePath('index')}#proiecte`" variant="outline">
        {{ t('caseStudy.otherProjects') }}
      </AppButton>
    </div>
  </SiteSection>
</template>
