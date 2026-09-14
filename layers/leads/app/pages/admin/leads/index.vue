<script setup lang="ts">
import { leadBudgetLabel, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminList } from '#layers/leads/state/useLeadsAdminList'

definePageMeta({ layout: 'admin' })

const { leads } = await useLeadsAdminList()

const STATUS_CLASS: Record<string, string> = {
  nou: 'text-signal',
  in_discutie: 'text-ink',
  castigat: 'text-ink',
  refuzat: 'text-muted',
}
</script>

<template>
  <div>
    <AdminTopbar title="Solicitări" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div v-if="!leads?.length" class="rounded border border-hairline p-8 text-center text-muted">
        Nicio solicitare încă.
      </div>
      <div v-else class="flex flex-col">
        <NuxtLink
          v-for="(lead, i) in leads"
          :key="lead.id"
          :to="`/admin/leads/${lead.id}`"
          class="flex flex-wrap items-center gap-4 border-t border-hairline py-3 no-underline hover:bg-hatch"
          :class="{ 'border-b': i === leads.length - 1 }"
        >
          <div class="flex-[0_0_100px] font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {{ new Date(lead.created_at).toLocaleDateString('ro-RO') }}
          </div>
          <div class="min-w-0 flex-[1_1_160px] text-[15px] text-ink">{{ lead.name }}</div>
          <div class="min-w-0 flex-[1_1_180px] text-[15px] text-muted">{{ lead.email }}</div>
          <div class="min-w-0 flex-[1_1_140px] text-[15px] text-muted">{{ lead.company || '—' }}</div>
          <div class="flex-[0_0_140px] text-[15px] text-muted">{{ leadBudgetLabel(lead.budget) }}</div>
          <div class="min-w-0 flex-[2_1_200px] truncate text-[15px] text-muted">{{ lead.message }}</div>
          <div class="flex-[0_0_100px] font-mono text-xs uppercase tracking-[0.08em]" :class="STATUS_CLASS[lead.status]">
            {{ leadStatusLabel(lead.status) }}
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
