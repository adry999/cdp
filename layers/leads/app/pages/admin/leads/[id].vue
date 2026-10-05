<script setup lang="ts">
import { LEAD_STATUSES, leadBudgetLabel, leadStageLabel, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminDetail } from '#layers/leads/state/useLeadsAdminDetail'

definePageMeta({ layout: 'admin', i18n: false })

const route = useRoute()
const { lead, notesState, actionError, updateStatus, saveNotes, archive } = await useLeadsAdminDetail(
  String(route.params.id),
)

const notes = ref(lead.value?.notes ?? '')

const NOTES_STATE_LABELS = {
  idle: 'Salvat automat la ieșirea din câmp',
  pending: 'Se salvează…',
  success: 'Salvat automat la ieșirea din câmp',
  error: 'Notele nu au fost salvate — încearcă din nou',
} as const
</script>

<template>
  <div v-if="lead">
    <AdminTopbar :title="lead.name" :back="{ to: '/admin/leads', label: 'Solicitări' }">
      <template #actions>
        <AppButton :href="`mailto:${lead.email}?subject=${encodeURIComponent('Re: solicitarea ta pe Codepedia')}`" variant="ink">
          Răspunde
        </AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[720px] flex-col gap-8">
        <section class="rounded border border-hairline p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="eyebrow text-muted">Nume</div>
              <div class="mt-1 text-[15px]">{{ lead.name }}</div>
            </div>
            <div>
              <div class="eyebrow text-muted">Email</div>
              <div class="mt-1 text-[15px]">{{ lead.email }}</div>
            </div>
            <div>
              <div class="eyebrow text-muted">Companie</div>
              <div class="mt-1 text-[15px]">{{ lead.company || '—' }}</div>
            </div>
            <div>
              <div class="eyebrow text-muted">Buget</div>
              <div class="mt-1 text-[15px]">{{ leadBudgetLabel(lead.budget) }}</div>
            </div>
            <div>
              <div class="eyebrow text-muted">Etapă</div>
              <div class="mt-1 text-[15px]">{{ leadStageLabel(lead.stage) }}</div>
            </div>
          </div>
          <div class="mt-4 border-t border-hairline pt-4">
            <div class="eyebrow text-muted">Mesaj</div>
            <p class="mt-2 whitespace-pre-wrap text-[15px]">{{ lead.message }}</p>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="eyebrow text-muted">Sursă</div>
          <div class="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div class="eyebrow-sm text-muted">Cum a aflat</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.source || '—' }}</div>
            </div>
            <div>
              <div class="eyebrow-sm text-muted">Pagină</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.page || '—' }}</div>
            </div>
            <div>
              <div class="eyebrow-sm text-muted">Referrer</div>
              <div class="mt-1 truncate text-[15px] text-muted">{{ lead.referrer || '—' }}</div>
            </div>
            <div>
              <div class="eyebrow-sm text-muted">UTM</div>
              <div class="mt-1 truncate text-[15px] text-muted">
                {{ lead.utm ? Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(' · ') : '—' }}
              </div>
            </div>
            <div>
              <div class="eyebrow-sm text-muted">Limbă</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.lang }}</div>
            </div>
            <div>
              <div class="eyebrow-sm text-muted">Dată</div>
              <div class="mt-1 text-[15px] text-muted">{{ new Date(lead.created_at).toLocaleString('ro-RO') }}</div>
            </div>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="eyebrow text-muted">Stare</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <ToggleChip
              v-for="status in LEAD_STATUSES"
              :key="status"
              size="admin"
              :pressed="lead.status === status"
              @click="updateStatus(status)"
            >
              {{ leadStatusLabel(status) }}
            </ToggleChip>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <AdminField v-model="notes" label="Note interne" as="textarea" rows="4" @blur="saveNotes(notes)" />
          <p
            aria-live="polite"
            class="mt-1 eyebrow-sm"
            :class="notesState === 'error' ? 'text-signal' : 'text-muted'"
          >
            {{ NOTES_STATE_LABELS[notesState] }}
          </p>
        </section>

        <p v-if="actionError" role="alert" class="eyebrow text-signal">
          {{ actionError.message }}
        </p>

        <AppButton variant="outline" class="w-fit" @click="archive">Arhivează</AppButton>
      </div>
    </div>
  </div>
</template>
