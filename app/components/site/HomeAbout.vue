<script setup lang="ts">
const { t, locale } = useI18n()
const lang = computed(() => locale.value as 'ro' | 'en')

const rows = [
  {
    label: { ro: 'Proprietate', en: 'Ownership' },
    text: {
      ro: 'Codul, baza de date și infrastructura sunt în conturile tale din prima zi.',
      en: 'Code, database and infrastructure are in your accounts from day one.',
    },
  },
  {
    label: { ro: 'Estimări', en: 'Estimates' },
    text: {
      ro: 'Preț fix pe etapă. Dacă greșim o estimare, costul este al nostru, nu al tău.',
      en: 'Fixed price per stage. If we get an estimate wrong, that is our cost, not yours.',
    },
  },
  {
    label: { ro: 'Limbi', en: 'Languages' },
    text: {
      ro: 'Română, engleză, rusă. Specificații scrise în limba pe care o preferi.',
      en: 'English, Romanian, Russian. Written specs in the language you prefer.',
    },
  },
] as const
</script>

<template>
  <SiteSection number="05" :label="t('home.about.sectionLabel')" inverted padding="ink">
    <h2 class="m-0 max-w-[24ch] text-[clamp(26px,3.4vw,40px)] font-medium leading-[1.12] tracking-[-0.025em]">
      {{ t('home.about.title') }}
    </h2>
    <p class="mt-[clamp(20px,2.5vw,28px)] max-w-[62ch] text-[clamp(16px,1.4vw,18px)] text-body-ink">
      {{ t('home.about.lead') }}
    </p>
    <div class="mt-[clamp(28px,3vw,44px)] flex flex-col">
      <TableRow
        v-for="(row, i) in rows"
        :key="row.label.ro"
        :label="row.label[lang]"
        label-width="180px"
        inverted
        :last="i === rows.length - 1"
      >
        <p class="m-0 max-w-[58ch] text-base">{{ row.text[lang] }}</p>
      </TableRow>
    </div>
  </SiteSection>
</template>
