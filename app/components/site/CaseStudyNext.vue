<script setup lang="ts">
import type { MappedProject } from '~/utils/mapProject'

defineProps<{ project: MappedProject }>()
const { t } = useI18n()
const localePath = useLocalePath()

const { data: home } = await useHomeData()
const email = computed(() => home.value?.settings?.contact_email ?? '')
</script>

<template>
  <SiteSection number="05" :label="t('caseStudy.sections.next')" padding-y="clamp(40px,6vw,88px)">
    <h2 class="m-0 max-w-[22ch] text-[clamp(26px,3.4vw,40px)] font-semibold leading-[1.1] tracking-[-0.025em]">
      {{ project.caseStudy.nextTitle }}
    </h2>
    <div class="mt-[clamp(20px,2.5vw,32px)] flex flex-wrap gap-3">
      <AppButton v-if="email" :href="`mailto:${email}`" variant="signal">{{ email }}</AppButton>
      <AppButton :href="`${localePath('index')}#proiecte`" variant="outline">
        {{ t('caseStudy.otherProjects') }}
      </AppButton>
    </div>
  </SiteSection>
</template>
