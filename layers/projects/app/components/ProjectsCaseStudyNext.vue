<script setup lang="ts">
import { mapProjectCard, type MappedProject, type ProjectCardRow } from '#layers/projects/domain/mapProject'
import { useQualifierAvailability } from '#layers/qualifier'

const props = defineProps<{ project: MappedProject }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()

// No `mailto:` here on purpose — the work email is never put into markup.
// The primary action is the qualification modal, with the homepage contact
// section as the fallback when the modal is disabled.
const nuxtApp = useNuxtApp()
const { isQualifierEnabled } = useQualifierAvailability()

function openQualifier() {
  nuxtApp.callHook('qualifier:open', {})
}

const { data: rows } = await useAsyncData<ProjectCardRow[]>('projects', () => $fetch('/api/projects'))

const otherProjects = computed(() =>
  (rows.value ?? [])
    .map((row) => mapProjectCard(row, locale.value as 'ro' | 'en'))
    .filter((other) => other.slug !== props.project.slug),
)
</script>

<template>
  <SiteSection number="" :label="t('caseStudy.sections.next')" inverted padding-y="clamp(48px,7vw,104px)">
    <template #label>
      <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">{{ t('caseStudy.sections.next') }}</div>
    </template>
    <h2 class="m-0 max-w-[22ch] text-[clamp(26px,3.4vw,40px)] font-semibold leading-[1.1] tracking-[-0.025em]">
      {{ t('caseStudy.nextTitle') }}
    </h2>
    <div class="mt-[clamp(20px,2.5vw,32px)]">
      <AppButton v-if="isQualifierEnabled" variant="signal" @click="openQualifier">
        {{ t('caseStudy.cta') }}
      </AppButton>
      <AppButton v-else :href="`${localePath('index')}#contact`" variant="signal">
        {{ t('caseStudy.cta') }}
      </AppButton>
    </div>
    <template v-if="otherProjects.length">
      <div class="mt-[clamp(40px,5vw,64px)] font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
        {{ t('caseStudy.otherProjects') }}
      </div>
      <ul class="m-0 mt-3 list-none border-b border-hairline-ink p-0">
        <li v-for="other in otherProjects" :key="other.slug">
          <NuxtLink
            :to="localePath({ name: 'proiecte-slug', params: { slug: other.slug } })"
            class="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-hairline-ink py-4 text-paper no-underline hover:text-signal"
          >
            <span class="text-lg font-medium tracking-[-0.01em]">{{ other.title }}</span>
            <span v-if="other.kind" class="font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">{{ other.kind }} →</span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </SiteSection>
</template>
