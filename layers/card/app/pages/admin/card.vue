<script setup lang="ts">
import { CARD_EVENT_KINDS, type CardEventKind } from '#layers/card/domain/cardEvents'
import { useCardStats } from '#layers/card/state/useCardStats'

definePageMeta({ layout: 'admin', i18n: false })

const { stats, loadError, period } = await useCardStats()

const KIND_LABELS: Record<CardEventKind, string> = {
  view: 'Scanări',
  save: 'Contact salvat',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  budget: 'Calculator',
}
</script>

<template>
  <div>
    <AdminTopbar title="Cărți de vizită" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mb-4 flex gap-2">
        <ToggleChip size="admin" :pressed="period === '30d'" @click="period = '30d'">Ultimele 30 de zile</ToggleChip>
        <ToggleChip size="admin" :pressed="period === 'all'" @click="period = 'all'">Tot timpul</ToggleChip>
      </div>

      <p v-if="loadError" role="alert" class="rounded border border-signal-text p-8 text-center text-signal-text">
        Statisticile nu au putut fi încărcate — reîncarcă pagina. ({{ loadError.message }})
      </p>
      <template v-else-if="stats">
        <table class="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr class="border-b border-ink">
              <th class="py-2 pr-4 eyebrow font-normal text-muted">Persoana</th>
              <th v-for="kind in CARD_EVENT_KINDS" :key="kind" class="py-2 pr-4 text-right eyebrow font-normal text-muted">
                {{ KIND_LABELS[kind] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in stats.rows" :key="row.slug" class="border-b border-hairline">
              <td class="py-3 pr-4">
                {{ row.name }}
                <span class="ml-2 font-mono text-[13px] text-muted">/c/{{ row.slug }}</span>
              </td>
              <td v-for="kind in CARD_EVENT_KINDS" :key="kind" class="py-3 pr-4 text-right tabular-nums">
                {{ row.counts[kind] }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="text-[28px] font-semibold tabular-nums">{{ stats.leads }}</span>
          <NuxtLink to="/admin/leads" class="text-[15px] text-muted">cereri trimise din pagina cărții de vizită →</NuxtLink>
        </div>
        <p class="mt-4 max-w-[70ch] text-[13px] text-muted">
          O scanare e o vizită pe /c (numărată o dată pe sesiune de browser). Fără cookie-uri și fără date
          personale: se salvează doar persoana, acțiunea, sursa (?s=) și ora.
        </p>
      </template>
    </div>
  </div>
</template>
