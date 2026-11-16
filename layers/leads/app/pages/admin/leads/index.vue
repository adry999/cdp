<script setup lang="ts">
import { formatAdminDate } from '#layers/core/shared/utils/formatAdminDate'
import { leadBudgetLabel, leadServiceStage, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminList } from '#layers/leads/state/useLeadsAdminList'

definePageMeta({ layout: 'admin', i18n: false })

const { leads, loadError, view } = await useLeadsAdminList()

const STATUS_CLASS: Record<string, string> = {
  nou: 'text-signal-text',
  in_discutie: 'text-ink',
  castigat: 'text-ink',
  refuzat: 'text-muted',
}
</script>

<template>
  <div>
    <AdminTopbar title="Solicitări" />

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="mb-4 flex gap-2">
        <ToggleChip size="admin" :pressed="view === 'active'" @click="view = 'active'">Active</ToggleChip>
        <ToggleChip size="admin" :pressed="view === 'archived'" @click="view = 'archived'">Arhivate</ToggleChip>
      </div>
      <p v-if="loadError" role="alert" class="rounded border border-signal-text p-8 text-center text-signal-text">
        Solicitările nu au putut fi încărcate — reîncarcă pagina. ({{ loadError.message }})
      </p>
      <div v-else-if="!leads?.length" class="rounded border border-hairline p-8 text-center text-muted">
        {{ view === 'archived' ? 'Nicio solicitare arhivată.' : 'Nicio solicitare încă.' }}
      </div>
      <!-- Rows are subgrids of this grid above the nav breakpoint, so the columns line up under the
           header; the message column needs 1280px. Below the breakpoint each lead wraps, name and
           status first. -->
      <div
        v-else
        class="flex flex-col nav:grid nav:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] nav:gap-x-4 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1.4fr)_auto]"
      >
        <div class="hidden pb-2 eyebrow-sm text-muted nav:col-span-full nav:grid nav:grid-cols-subgrid" aria-hidden="true">
          <span>Data</span>
          <span>Nume / Companie</span>
          <span>Email</span>
          <span>Buget / Serviciu · Etapă</span>
          <span class="hidden xl:block">Mesaj</span>
          <span>Stare</span>
        </div>
        <NuxtLink
          v-for="(lead, i) in leads"
          :key="lead.id"
          :to="`/admin/leads/${lead.id}`"
          class="flex flex-wrap items-start gap-x-4 gap-y-1 border-t border-hairline py-3 text-[15px] text-muted no-underline hover:bg-hatch hover:no-underline nav:col-span-full nav:grid nav:grid-cols-subgrid nav:items-center"
          :class="{ 'border-b': i === leads.length - 1 }"
        >
          <div class="order-2 mt-0.5 eyebrow text-muted nav:order-none nav:mt-0">
            {{ formatAdminDate(lead.created_at) }}
          </div>
          <div class="order-0 min-w-0 flex-[1_1_calc(100%-7rem)] nav:order-none">
            <div class="truncate text-ink">{{ lead.name }}</div>
            <div v-if="lead.company" class="truncate text-[13px]">{{ lead.company }}</div>
          </div>
          <div class="order-3 min-w-0 truncate nav:order-none">{{ lead.email }}</div>
          <div class="order-4 min-w-0 nav:order-none nav:max-w-[200px]">
            <div class="truncate">{{ leadBudgetLabel(lead.budget) }}</div>
            <div v-if="leadServiceStage(lead.service, lead.stage)" class="truncate text-[13px]">
              {{ leadServiceStage(lead.service, lead.stage) }}
            </div>
          </div>
          <div class="order-5 min-w-0 basis-full truncate nav:order-none nav:hidden xl:block">{{ lead.message }}</div>
          <div class="order-1 mt-0.5 eyebrow nav:order-none nav:mt-0" :class="STATUS_CLASS[lead.status]">
            {{ leadStatusLabel(lead.status) }}
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
