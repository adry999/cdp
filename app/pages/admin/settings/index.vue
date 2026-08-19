<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()

const { data: row } = await useAsyncData('admin-settings', async () => {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data
})

const s = row.value

const form = reactive({
  contactEmail: s?.contact_email ?? '',
  contactPhone: s?.contact_phone ?? '',
  hours: s?.hours ?? '',
  responseTime: { ro: s?.response_time_ro ?? '', en: s?.response_time_en ?? '' },
  nextOpening: { ro: s?.next_opening_ro ?? '', en: s?.next_opening_en ?? '' },
  concurrentProjects: s?.concurrent_projects ?? '',
  ndaNote: { ro: s?.nda_note_ro ?? '', en: s?.nda_note_en ?? '' },
  footerLine: { ro: s?.footer_line_ro ?? '', en: s?.footer_line_en ?? '' },
  copyrightYear: s?.copyright_year != null ? String(s.copyright_year) : '',
  metaTitle: { ro: s?.meta_title_ro ?? '', en: s?.meta_title_en ?? '' },
  metaDescription: { ro: s?.meta_description_ro ?? '', en: s?.meta_description_en ?? '' },
})

const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

async function save() {
  saveState.value = 'saving'
  const { error } = await supabase.from('site_settings').upsert({
    id: 1,
    contact_email: form.contactEmail,
    contact_phone: form.contactPhone || null,
    hours: form.hours || null,
    response_time_ro: form.responseTime.ro || null,
    response_time_en: form.responseTime.en || null,
    next_opening_ro: form.nextOpening.ro || null,
    next_opening_en: form.nextOpening.en || null,
    concurrent_projects: form.concurrentProjects || null,
    nda_note_ro: form.ndaNote.ro || null,
    nda_note_en: form.ndaNote.en || null,
    footer_line_ro: form.footerLine.ro || null,
    footer_line_en: form.footerLine.en || null,
    copyright_year: form.copyrightYear ? Number(form.copyrightYear) : null,
    meta_title_ro: form.metaTitle.ro || null,
    meta_title_en: form.metaTitle.en || null,
    meta_description_ro: form.metaDescription.ro || null,
    meta_description_en: form.metaDescription.en || null,
    updated_at: new Date().toISOString(),
  })
  saveState.value = error ? 'error' : 'saved'
}
</script>

<template>
  <div>
    <AdminTopbar title="Setări">
      <template #actions>
        <span
          v-if="saveState !== 'idle'"
          class="font-mono text-xs uppercase tracking-[0.08em]"
          :class="saveState === 'error' ? 'text-signal' : 'text-muted'"
        >
          {{ { saving: 'Se salvează…', saved: 'Salvat', error: 'Eroare la salvare' }[saveState] }}
        </span>
        <AppButton variant="ink" @click="save">Salvează</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Contact</div>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <AdminField label="Email de contact" type="email" v-model="form.contactEmail" />
            <AdminField label="Telefon" type="tel" v-model="form.contactPhone" />
          </div>
          <div class="mt-4">
            <AdminField label="Program" v-model="form.hours" />
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Timp de răspuns" v-model:ro="form.responseTime.ro" v-model:en="form.responseTime.en" />
            <AdminFieldPair label="Următoarea disponibilitate" v-model:ro="form.nextOpening.ro" v-model:en="form.nextOpening.en" />
          </div>
          <div class="mt-4">
            <AdminField label="Proiecte simultane" v-model="form.concurrentProjects" />
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Site</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Notă NDA (sub grila de proiecte)" textarea v-model:ro="form.ndaNote.ro" v-model:en="form.ndaNote.en" />
            <AdminFieldPair label="Linia din footer" v-model:ro="form.footerLine.ro" v-model:en="form.footerLine.en" />
          </div>
          <div class="mt-4">
            <AdminField label="An copyright" v-model="form.copyrightYear" />
          </div>
        </section>

        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">SEO</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Meta title" v-model:ro="form.metaTitle.ro" v-model:en="form.metaTitle.en" />
            <AdminFieldPair label="Meta description" textarea v-model:ro="form.metaDescription.ro" v-model:en="form.metaDescription.en" />
          </div>
          <div class="mt-4">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Imagine OG</div>
            <div class="mt-2 flex items-center gap-3 rounded border border-hairline px-3.5 py-3 text-[15px] text-muted">
              Se încarcă din Supabase Storage — disponibil după conectare.
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
