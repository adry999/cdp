<script setup lang="ts">
import { LEAD_STATUSES, leadBudgetLabel, leadStatusLabel } from '#layers/leads/domain/lead'
import { useLeadsAdminDetail } from '#layers/leads/state/useLeadsAdminDetail'

definePageMeta({ layout: 'admin' })

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
    <AdminTopbar :title="lead.name">
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
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Nume</div>
              <div class="mt-1 text-[15px]">{{ lead.name }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Email</div>
              <div class="mt-1 text-[15px]">{{ lead.email }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Companie</div>
              <div class="mt-1 text-[15px]">{{ lead.company || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Buget</div>
              <div class="mt-1 text-[15px]">{{ leadBudgetLabel(lead.budget) }}</div>
            </div>
          </div>
          <div class="mt-4 border-t border-hairline pt-4">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Mesaj</div>
            <p class="mt-2 whitespace-pre-wrap text-[15px]">{{ lead.message }}</p>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Sursă</div>
          <div class="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Cum a aflat</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.source || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Pagină</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.page || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Referrer</div>
              <div class="mt-1 truncate text-[15px] text-muted">{{ lead.referrer || '—' }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">UTM</div>
              <div class="mt-1 truncate text-[15px] text-muted">
                {{ lead.utm ? Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(' · ') : '—' }}
              </div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Limbă</div>
              <div class="mt-1 text-[15px] text-muted">{{ lead.lang }}</div>
            </div>
            <div>
              <div class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-ink">Dată</div>
              <div class="mt-1 text-[15px] text-muted">{{ new Date(lead.created_at).toLocaleString('ro-RO') }}</div>
            </div>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Stare</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="status in LEAD_STATUSES"
              :key="status"
              type="button"
              class="cursor-pointer rounded border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em]"
              :class="
                lead.status === status
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline text-muted hover:border-ink hover:text-ink'
              "
              @click="updateStatus(status)"
            >
              {{ leadStatusLabel(status) }}
            </button>
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Note interne</div>
          <textarea
            v-model="notes"
            rows="4"
            class="mt-3 w-full rounded border border-hairline px-3.5 py-3 text-base outline-none focus:border-ink"
            @blur="saveNotes(notes)"
          />
          <p
            aria-live="polite"
            class="mt-1 font-mono text-[11px] uppercase tracking-[0.08em]"
            :class="notesState === 'error' ? 'text-signal' : 'text-muted-ink'"
          >
            {{ NOTES_STATE_LABELS[notesState] }}
          </p>
        </section>

        <p v-if="actionError" role="alert" class="font-mono text-xs uppercase tracking-[0.08em] text-signal">
          {{ actionError.message }}
        </p>

        <AppButton variant="outline" class="w-fit" @click="archive">Arhivează</AppButton>
      </div>
    </div>
  </div>
</template>
