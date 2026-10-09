<script setup lang="ts">
import { TEAM } from '#layers/content/data/team'

const { t } = useI18n()
const siteLocale = useSiteLocale()
</script>

<template>
  <SiteSection v-if="TEAM.length" :label="t('about.team.label')">
    <h2 class="m-0 max-w-[28ch] heading-section">
      {{ t('about.team.title') }}
    </h2>
    <ul class="m-0 mt-7 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4 p-0">
      <li v-for="member in TEAM" :key="member.name" class="flex flex-col gap-3">
        <MediaFrame ratio="4/3" :src="member.photo" :alt="member.name" />
        <div>
          <div class="text-[17px] font-medium tracking-[-0.02em]">{{ member.name }}</div>
          <div class="mt-0.5 eyebrow-sm text-muted">
            {{ member.role[siteLocale] }}
          </div>
        </div>
      </li>
    </ul>
  </SiteSection>
</template>
