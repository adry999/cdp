<script setup lang="ts">
const { t } = useI18n()

// Team data does not exist yet: three placeholder cards until real names, roles and photos are supplied.
const PLACEHOLDER_COUNT = 3
</script>

<template>
  <SiteSection :label="t('about.team.label')">
    <h2 class="m-0 max-w-[28ch] text-[clamp(24px,3vw,34px)] font-medium leading-[1.15] tracking-[-0.02em]">
      {{ t('about.team.title') }}
    </h2>
    <ul class="m-0 mt-7 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4 p-0">
      <li v-for="n in PLACEHOLDER_COUNT" :key="n" class="flex flex-col gap-3">
        <MediaFrame ratio="4/3" :label="t('about.team.photo')" />
        <div>
          <div class="text-[17px] font-medium tracking-[-0.02em]">{{ t('about.team.name') }}</div>
          <div class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            {{ t('about.team.role') }}
          </div>
        </div>
      </li>
    </ul>
    <p class="m-0 mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
      {{ t('about.team.placeholderNote') }}
    </p>
  </SiteSection>
</template>
