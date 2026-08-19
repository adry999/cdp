<script setup lang="ts">
import type { HomeApiResponse } from '~/types/home'

const { t } = useI18n()
const { data } = await useAsyncData<HomeApiResponse>('home', () => $fetch('/api/home'))
const groups = computed(() => data.value?.stackGroups ?? [])
</script>

<template>
  <SiteSection number="02" :label="t('home.stack.sectionLabel')" section-id="stack">
    <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('home.stack.title') }}
    </h2>
    <div class="mt-[clamp(28px,3vw,40px)] flex flex-col">
      <TableRow
        v-for="(group, i) in groups"
        :key="group.name"
        :label="group.name"
        label-width="120px"
        :last="i === groups.length - 1"
      >
        <div class="flex flex-wrap gap-2">
          <TechChip v-for="chip in group.items" :key="chip" :label="chip" />
        </div>
      </TableRow>
    </div>
  </SiteSection>
</template>
