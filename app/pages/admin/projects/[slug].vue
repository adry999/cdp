<script setup lang="ts">
import type { ProjectRow } from '~/utils/mapProject'
import { usableGallery, validateProjectPayload } from '~~/shared/utils/projectPayload'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const slug = route.params.slug as string
const isNew = slug === 'nou'
const supabase = useSupabaseClient()

const PROJECT_SELECT = `
  id, slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, year, tech, published_at,
  cover_path, cover_alt_ro, cover_alt_en, hero_path, hero_alt_ro, hero_alt_en,
  context_heading_ro, context_heading_en, context_body_ro, context_body_en,
  solution_heading_ro, solution_heading_en,
  quote_ro, quote_en, quote_author, quote_role_ro, quote_role_en, quote_company,
  next_title_ro, next_title_en,
  project_facts(label_ro,label_en,value_ro,value_en,sort_order),
  project_steps(title_ro,title_en,body_ro,body_en,sort_order),
  project_stats(value,label_ro,label_en,sort_order),
  project_images(path,alt_ro,alt_en,sort_order)
`

const { data: existing } = await useAsyncData<(ProjectRow & { id: string; published_at: string | null }) | null>(
  `admin-project-${slug}`,
  async () => {
    if (isNew) return null
    const { data, error } = await supabase.from('projects').select(PROJECT_SELECT).eq('slug_ro', slug).maybeSingle()
    if (error) throw error
    return data as (ProjectRow & { id: string; published_at: string | null }) | null
  },
)

function bilingual(ro = '', en = '') {
  return { ro, en: en ?? '' }
}

const e = existing.value
const projectId = ref<string | null>(e?.id ?? null)

const form = reactive({
  slugRo: e?.slug_ro ?? '',
  slugEn: e?.slug_en ?? e?.slug_ro ?? '',
  title: bilingual(e?.title_ro, e?.title_en ?? ''),
  cardTitle: bilingual(e?.card_title_ro, e?.card_title_en ?? ''),
  summary: bilingual(e?.summary_ro, e?.summary_en ?? ''),
  lead: bilingual(e?.lead_ro, e?.lead_en ?? ''),
  year: e?.year != null ? String(e.year) : '2026',
  tech: [...(e?.tech ?? [])] as string[],
  techInput: '',

  coverPath: e?.cover_path ?? null,
  coverAlt: bilingual(e?.cover_alt_ro ?? '', e?.cover_alt_en ?? ''),
  heroPath: e?.hero_path ?? null,
  heroAlt: bilingual(e?.hero_alt_ro ?? '', e?.hero_alt_en ?? ''),
  // Blank slots are UI-only scaffolding for the "add image" flow — never
  // written as project_images rows (a NOT NULL path of '' renders a broken
  // <img> on the public site). usableGallery() strips them again on save.
  gallery: (
    e?.project_images?.filter((img) => img.path)?.length
      ? e.project_images.filter((img) => img.path)
      : []
  ).map((img) => ({ path: img.path ?? null, altRo: img.alt_ro ?? '', altEn: img.alt_en ?? '' })),

  facts: (
    e?.project_facts?.length
      ? e.project_facts
      : [
          { label_ro: 'Client', label_en: 'Client', value_ro: '', value_en: '' },
          { label_ro: 'Durată', label_en: 'Duration', value_ro: '', value_en: '' },
          { label_ro: 'Echipă', label_en: 'Team', value_ro: '', value_en: '' },
          { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '', value_en: '' },
        ]
  ).map((f) => ({ label: bilingual(f.label_ro, f.label_en ?? ''), value: bilingual(f.value_ro, f.value_en ?? '') })),

  contextHeading: bilingual(e?.context_heading_ro ?? '', e?.context_heading_en ?? ''),
  contextBody: bilingual(e?.context_body_ro ?? '', e?.context_body_en ?? ''),

  solutionHeading: bilingual(e?.solution_heading_ro ?? '', e?.solution_heading_en ?? ''),
  steps: (e?.project_steps?.length ? e.project_steps : [{ title_ro: '', title_en: '', body_ro: '', body_en: '' }]).map(
    (s) => ({ title: bilingual(s.title_ro, s.title_en ?? ''), body: bilingual(s.body_ro, s.body_en ?? '') }),
  ),

  stats: (e?.project_stats ?? []).map((s) => ({ value: s.value, label: bilingual(s.label_ro, s.label_en ?? '') })),
  quote: bilingual(e?.quote_ro ?? '', e?.quote_en ?? ''),
  quoteAuthor: e?.quote_author ?? '',
  quoteRole: bilingual(e?.quote_role_ro ?? '', e?.quote_role_en ?? ''),
  quoteCompany: e?.quote_company ?? '',

  nextTitle: bilingual(e?.next_title_ro ?? '', e?.next_title_en ?? ''),

  published: !!e?.published_at,
})

const titleWarn = computed(() => form.title.ro.length > 60)
const summaryWarn = computed(() => form.summary.ro.length > 200)

function addTech() {
  const value = form.techInput.trim()
  if (value && !form.tech.includes(value)) form.tech.push(value)
  form.techInput = ''
}
function removeTech(i: number) {
  form.tech.splice(i, 1)
}
function addStep() {
  form.steps.push({ title: bilingual(), body: bilingual() })
}
function removeStep(i: number) {
  if (form.steps.length > 1) form.steps.splice(i, 1)
}
function addStat() {
  if (form.stats.length < 4) form.stats.push({ value: '', label: bilingual() })
}
function removeStat(i: number) {
  form.stats.splice(i, 1)
}
function addFact() {
  form.facts.push({ label: bilingual(), value: bilingual() })
}
function removeFact(i: number) {
  if (form.facts.length > 1) form.facts.splice(i, 1)
}
function addGalleryImage() {
  form.gallery.push({ path: null, altRo: '', altEn: '' })
}
function removeGalleryImage(i: number) {
  form.gallery.splice(i, 1)
}

const dragInfo = ref<{ list: 'facts' | 'steps' | 'stats'; index: number } | null>(null)

function reorderStart(list: 'facts' | 'steps' | 'stats', index: number) {
  dragInfo.value = { list, index }
}
function reorderDrop(list: 'facts' | 'steps' | 'stats', index: number) {
  if (!dragInfo.value || dragInfo.value.list !== list || dragInfo.value.index === index) return
  const arr = form[list]
  const [moved] = arr.splice(dragInfo.value.index, 1)
  arr.splice(index, 0, moved as never)
  dragInfo.value = null
}

const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const saveError = ref('')

async function save() {
  saveError.value = ''

  const issues = validateProjectPayload({
    id: projectId.value,
    slugRo: form.slugRo,
    slugEn: form.slugEn,
    published: form.published,
    title: form.title,
    cardTitle: form.cardTitle,
    summary: form.summary,
    lead: form.lead,
    contextHeading: form.contextHeading,
    gallery: form.gallery,
  })

  if (issues.length) {
    saveState.value = 'error'
    saveError.value = issues.map((i) => i.message).join(' ')
    return
  }

  saveState.value = 'saving'

  // Single RPC, single transaction: either the whole project saves — project
  // row, facts, steps, stats, gallery, redirect on slug change — or none of it
  // does. See supabase/migrations/20260826120200_save_project_rpc.sql.
  const { data, error } = await supabase.rpc('save_project', {
    payload: {
      id: projectId.value,
      slug_ro: form.slugRo.trim(),
      slug_en: form.slugEn.trim() || form.slugRo.trim(),
      published: form.published,
      title_ro: form.title.ro,
      title_en: form.title.en || null,
      card_title_ro: form.cardTitle.ro,
      card_title_en: form.cardTitle.en || null,
      summary_ro: form.summary.ro,
      summary_en: form.summary.en || null,
      lead_ro: form.lead.ro,
      lead_en: form.lead.en || null,
      year: form.year ? Number(form.year) : null,
      tech: form.tech,
      cover_path: form.coverPath,
      cover_alt_ro: form.coverAlt.ro || null,
      cover_alt_en: form.coverAlt.en || null,
      hero_path: form.heroPath,
      hero_alt_ro: form.heroAlt.ro || null,
      hero_alt_en: form.heroAlt.en || null,
      context_heading_ro: form.contextHeading.ro,
      context_heading_en: form.contextHeading.en || null,
      context_body_ro: form.contextBody.ro || null,
      context_body_en: form.contextBody.en || null,
      solution_heading_ro: form.solutionHeading.ro || null,
      solution_heading_en: form.solutionHeading.en || null,
      quote_ro: form.quote.ro || null,
      quote_en: form.quote.en || null,
      quote_author: form.quoteAuthor || null,
      quote_role_ro: form.quoteRole.ro || null,
      quote_role_en: form.quoteRole.en || null,
      quote_company: form.quoteCompany || null,
      next_title_ro: form.nextTitle.ro || null,
      next_title_en: form.nextTitle.en || null,
      sort_order: null,
      facts: form.facts.map((f) => ({
        label_ro: f.label.ro,
        label_en: f.label.en || null,
        value_ro: f.value.ro,
        value_en: f.value.en || null,
      })),
      steps: form.steps.map((s) => ({
        title_ro: s.title.ro,
        title_en: s.title.en || null,
        body_ro: s.body.ro,
        body_en: s.body.en || null,
      })),
      stats: form.stats.map((s) => ({
        value: s.value,
        label_ro: s.label.ro,
        label_en: s.label.en || null,
      })),
      images: usableGallery(form.gallery).map((img) => ({
        path: img.path,
        alt_ro: img.altRo || null,
        alt_en: img.altEn || null,
        aspect: '4/3',
      })),
    },
  })

  if (error) {
    saveState.value = 'error'
    saveError.value = error.message
    return
  }

  const result = data as { id: string; slug_ro: string; slug_en: string }
  projectId.value = result.id
  saveState.value = 'saved'

  if (isNew || form.slugRo.trim() !== slug) {
    await navigateTo(`/admin/projects/${result.slug_ro}`)
  }
}
</script>

<template>
  <div>
    <AdminTopbar :title="isNew ? 'Proiect nou' : form.cardTitle.ro || slug">
      <template #actions>
        <span class="font-mono text-xs uppercase tracking-[0.08em]" :class="form.published ? 'text-signal' : 'text-muted'">
          {{ form.published ? 'Publicat' : 'Draft' }}
        </span>
        <span
          v-if="saveState !== 'idle'"
          class="font-mono text-xs uppercase tracking-[0.08em]"
          :class="saveState === 'error' ? 'text-signal' : 'text-muted'"
        >
          {{ { saving: 'Se salvează…', saved: 'Salvat', error: saveError || 'Eroare' }[saveState] }}
        </span>
        <AppButton variant="ink" @click="save">Salvează</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col gap-8">
        <!-- Identitate -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Identitate</div>
          <div class="mt-4 flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <AdminField label="Slug RO" v-model="form.slugRo" />
              <AdminField label="Slug EN" v-model="form.slugEn" />
            </div>
            <AdminFieldPair label="Titlu (H1 studiu de caz)" v-model:ro="form.title.ro" v-model:en="form.title.en" required />
            <AdminFieldPair label="Titlu card (homepage)" v-model:ro="form.cardTitle.ro" v-model:en="form.cardTitle.en" required />
            <div>
              <AdminFieldPair label="Descriere card" textarea v-model:ro="form.summary.ro" v-model:en="form.summary.en" required />
              <div class="mt-1 text-right font-mono text-[11px] uppercase tracking-[0.08em]" :class="summaryWarn ? 'text-signal' : 'text-muted-ink'">
                {{ form.summary.ro.length }} / 200
              </div>
            </div>
            <div v-if="titleWarn" class="font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
              Titlul RO depășește 60 de caractere — designul se poate strica.
            </div>
            <AdminFieldPair label="Lead (sub H1)" textarea v-model:ro="form.lead.ro" v-model:en="form.lead.en" required />
            <div class="grid grid-cols-2 gap-4">
              <AdminField label="An" v-model="form.year" />
              <div>
                <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Tech</div>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <TechChip v-for="(tech, i) in form.tech" :key="tech">
                    {{ tech }}
                    <button type="button" class="ml-1.5 cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal" @click="removeTech(i)">×</button>
                  </TechChip>
                  <input
                    v-model="form.techInput"
                    placeholder="+ enter"
                    class="w-24 border-0 border-b border-hairline bg-transparent py-1 text-sm outline-none focus:border-ink"
                    @keydown.enter.prevent="addTech"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Imagini -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Imagini</div>
          <div class="mt-4 flex flex-col gap-6">
            <div>
              <AdminImageUpload
                v-model="form.coverPath"
                ratio="16/10"
                label="[ copertă card — 1200 × 750 ]"
                :path-prefix="`${form.slugRo || 'proiect-nou'}/cover`"
              />
              <div class="mt-3">
                <AdminFieldPair label="Text alternativ copertă" v-model:ro="form.coverAlt.ro" v-model:en="form.coverAlt.en" required />
              </div>
            </div>
            <div>
              <AdminImageUpload
                v-model="form.heroPath"
                ratio="16/9"
                label="[ captură principală — 1600 × 900 ]"
                :path-prefix="`${form.slugRo || 'proiect-nou'}/hero`"
              />
              <div class="mt-3">
                <AdminFieldPair label="Text alternativ captură principală" v-model:ro="form.heroAlt.ro" v-model:en="form.heroAlt.en" required />
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Galerie (minim 2 la publicare)</div>
                <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-signal" @click="addGalleryImage">
                  + Imagine
                </button>
              </div>
              <div v-if="!form.gallery.length" class="mt-2 rounded border border-dashed border-hairline p-4 text-center text-[13px] text-muted">
                Fără imagini încă — apasă „+ Imagine".
              </div>
              <div v-else class="mt-2 grid grid-cols-2 gap-4">
                <div v-for="(img, i) in form.gallery" :key="i" class="relative">
                  <AdminImageUpload
                    v-model="img.path"
                    ratio="4/3"
                    :label="`[ galerie ${i + 1} ]`"
                    :path-prefix="`${form.slugRo || 'proiect-nou'}/gallery-${i}`"
                  />
                  <div class="mt-3 flex items-start gap-3">
                    <div class="flex-1">
                      <AdminFieldPair label="Text alternativ" v-model:ro="img.altRo" v-model:en="img.altEn" />
                    </div>
                    <button type="button" class="mt-6 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal" @click="removeGalleryImage(i)">
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Date -->
        <section class="rounded border border-hairline p-6">
          <div class="flex items-center justify-between">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Date (secțiunea 01)</div>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-signal" @click="addFact">
              + Fapt
            </button>
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <div
              v-for="(fact, i) in form.facts"
              :key="i"
              draggable="true"
              class="flex cursor-grab gap-4 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
              :class="{ 'opacity-40': dragInfo?.list === 'facts' && dragInfo.index === i }"
              @dragstart="reorderStart('facts', i)"
              @dragover.prevent
              @drop="reorderDrop('facts', i)"
            >
              <div class="grid flex-1 grid-cols-2 gap-4">
                <AdminFieldPair label="Etichetă" v-model:ro="fact.label.ro" v-model:en="fact.label.en" />
                <AdminFieldPair label="Valoare" v-model:ro="fact.value.ro" v-model:en="fact.value.en" />
              </div>
              <button
                v-if="form.facts.length > 1"
                type="button"
                class="mt-6 h-fit cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal"
                @click="removeFact(i)"
              >
                Șterge
              </button>
            </div>
          </div>
        </section>

        <!-- Context -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Context (secțiunea 02)</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Titlu" v-model:ro="form.contextHeading.ro" v-model:en="form.contextHeading.en" required />
            <AdminFieldPair label="Text (paragrafe separate de o linie goală)" textarea v-model:ro="form.contextBody.ro" v-model:en="form.contextBody.en" required />
          </div>
        </section>

        <!-- Soluție -->
        <section class="rounded border border-hairline p-6">
          <div class="flex items-center justify-between">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Soluție (secțiunea 03)</div>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-signal" @click="addStep">
              + Pas
            </button>
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Titlu secțiune" v-model:ro="form.solutionHeading.ro" v-model:en="form.solutionHeading.en" required />
            <div
              v-for="(step, i) in form.steps"
              :key="i"
              draggable="true"
              class="flex cursor-grab flex-col gap-3 border-t border-hairline pt-4"
              :class="{ 'opacity-40': dragInfo?.list === 'steps' && dragInfo.index === i }"
              @dragstart="reorderStart('steps', i)"
              @dragover.prevent
              @drop="reorderDrop('steps', i)"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs tracking-[0.08em] text-muted">⠿ Pas {{ String(i + 1).padStart(2, '0') }}</span>
                <button
                  v-if="form.steps.length > 1"
                  type="button"
                  class="cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal"
                  @click="removeStep(i)"
                >
                  Șterge
                </button>
              </div>
              <AdminFieldPair label="Titlu pas" v-model:ro="step.title.ro" v-model:en="step.title.en" />
              <AdminFieldPair label="Descriere" textarea v-model:ro="step.body.ro" v-model:en="step.body.en" />
            </div>
          </div>
        </section>

        <!-- Rezultat -->
        <section class="rounded border border-hairline p-6">
          <div class="flex items-center justify-between">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Rezultat (secțiunea 04)</div>
            <button
              v-if="form.stats.length < 4"
              type="button"
              class="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-signal"
              @click="addStat"
            >
              + Statistică
            </button>
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <div
              v-for="(stat, i) in form.stats"
              :key="i"
              draggable="true"
              class="flex cursor-grab items-end gap-3 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
              :class="{ 'opacity-40': dragInfo?.list === 'stats' && dragInfo.index === i }"
              @dragstart="reorderStart('stats', i)"
              @dragover.prevent
              @drop="reorderDrop('stats', i)"
            >
              <div class="w-32 flex-none">
                <AdminField label="Valoare" v-model="stat.value" />
              </div>
              <div class="flex-1">
                <AdminFieldPair label="Etichetă" v-model:ro="stat.label.ro" v-model:en="stat.label.en" />
              </div>
              <button type="button" class="mb-2.5 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal" @click="removeStat(i)">
                Șterge
              </button>
            </div>

            <div class="border-t border-hairline pt-4">
              <AdminFieldPair label="Citat client" textarea v-model:ro="form.quote.ro" v-model:en="form.quote.en" />
              <p class="mt-1 text-[13px] text-muted">Dacă citatul lipsește, blocul nu se randează pe site.</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <AdminField label="Nume" v-model="form.quoteAuthor" />
              <AdminFieldPair label="Funcție" v-model:ro="form.quoteRole.ro" v-model:en="form.quoteRole.en" />
              <AdminField label="Companie" v-model="form.quoteCompany" />
            </div>
          </div>
        </section>

        <!-- Următorul pas -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Următorul pas (secțiunea 05)</div>
          <div class="mt-4">
            <AdminFieldPair label="Titlu CTA de final" v-model:ro="form.nextTitle.ro" v-model:en="form.nextTitle.en" />
          </div>
        </section>

        <!-- Publicare -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Publicare</div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
            <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
              <input v-model="form.published" type="checkbox" class="accent-signal" />
              <span :class="form.published ? 'text-signal' : 'text-muted'">
                {{ form.published ? 'Publicat' : 'Draft' }}
              </span>
            </label>
            <div class="flex gap-3 font-mono text-xs uppercase tracking-[0.08em]">
              <NuxtLink :to="`/proiecte/${form.slugRo}`" class="text-muted hover:text-ink">Vezi pe site</NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
