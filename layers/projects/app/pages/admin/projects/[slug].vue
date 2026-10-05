<script setup lang="ts">
import type { ProjectRow } from '#layers/projects/domain/mapProject'
import { usableGallery, validateProjectPayload } from '#layers/projects/domain/projectPayload'
import { ADMIN_PROJECT_SELECT } from '#layers/projects/domain/projectSelect'
import { storageKeyFromPublicUrl } from '#layers/projects/domain/storagePath'
import { useRevalidatePublicCache } from '#layers/projects/state/useRevalidatePublicCache'
import { SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'

definePageMeta({ layout: 'admin', i18n: false })

const route = useRoute()
const slug = route.params.slug as string
const isNew = slug === 'nou'
const supabase = useSupabaseClient()

const { data: existing } = await useAsyncData<(ProjectRow & { id: string; published_at: string | null }) | null>(
  `admin-project-${slug}`,
  async () => {
    if (isNew) return null
    const { data, error } = await supabase.from('projects').select(ADMIN_PROJECT_SELECT).eq('slug_ro', slug).maybeSingle()
    if (error) throw error
    return data as (ProjectRow & { id: string; published_at: string | null }) | null
  },
)

function bilingual(ro = '', en = '') {
  return { ro, en: en ?? '' }
}

const existingProject = existing.value
const projectId = ref<string | null>(existingProject?.id ?? null)

const form = reactive({
  slugRo: existingProject?.slug_ro ?? '',
  slugEn: existingProject?.slug_en ?? existingProject?.slug_ro ?? '',
  title: bilingual(existingProject?.title_ro, existingProject?.title_en ?? ''),
  cardTitle: bilingual(existingProject?.card_title_ro, existingProject?.card_title_en ?? ''),
  summary: bilingual(existingProject?.summary_ro, existingProject?.summary_en ?? ''),
  lead: bilingual(existingProject?.lead_ro, existingProject?.lead_en ?? ''),
  year: existingProject?.year != null ? String(existingProject.year) : '2026',
  tech: [...(existingProject?.tech ?? [])] as string[],
  techInput: '',
  serviceTag: existingProject?.service_tag ?? null,
  kind: bilingual(existingProject?.kind_ro ?? '', existingProject?.kind_en ?? ''),
  tags: bilingual((existingProject?.tags_ro ?? []).join(', '), (existingProject?.tags_en ?? []).join(', ')),
  liveUrl: existingProject?.live_url ?? '',
  liveUrlLabel: bilingual(existingProject?.live_url_label_ro ?? '', existingProject?.live_url_label_en ?? ''),

  coverPath: existingProject?.cover_path ?? null,
  coverAlt: bilingual(existingProject?.cover_alt_ro ?? '', existingProject?.cover_alt_en ?? ''),
  heroPath: existingProject?.hero_path ?? null,
  heroAlt: bilingual(existingProject?.hero_alt_ro ?? '', existingProject?.hero_alt_en ?? ''),
  // Blank slots are UI-only scaffolding for the "add image" flow — never
  // written as project_images rows (a NOT NULL path of '' renders a broken
  // <img> on the public site). usableGallery() strips them again on save.
  gallery: (
    existingProject?.project_images?.filter((img) => img.path)?.length
      ? existingProject.project_images.filter((img) => img.path)
      : []
  ).map((img) => ({ path: img.path ?? null, altRo: img.alt_ro ?? '', altEn: img.alt_en ?? '', aspect: img.aspect ?? '4/3' })),

  facts: (
    existingProject?.project_facts?.length
      ? existingProject.project_facts
      : [
          { label_ro: 'Client', label_en: 'Client', value_ro: '', value_en: '' },
          { label_ro: 'Durată', label_en: 'Duration', value_ro: '', value_en: '' },
          { label_ro: 'Echipă', label_en: 'Team', value_ro: '', value_en: '' },
          { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '', value_en: '' },
        ]
  ).map((f) => ({ label: bilingual(f.label_ro, f.label_en ?? ''), value: bilingual(f.value_ro, f.value_en ?? '') })),

  contextBody: bilingual(existingProject?.context_body_ro ?? '', existingProject?.context_body_en ?? ''),
  solutionBody: bilingual(existingProject?.solution_body_ro ?? '', existingProject?.solution_body_en ?? ''),
  stack: (existingProject?.project_stack ?? []).map((s) => ({ name: s.name, role: bilingual(s.role_ro, s.role_en ?? '') })),
  obstaclesBody: bilingual(existingProject?.obstacles_body_ro ?? '', existingProject?.obstacles_body_en ?? ''),
  changesBody: bilingual(existingProject?.changes_body_ro ?? '', existingProject?.changes_body_en ?? ''),
  resultBody: bilingual(existingProject?.result_body_ro ?? '', existingProject?.result_body_en ?? ''),
  screensDemo: existingProject?.screens_demo ?? false,

  stats: (existingProject?.project_stats ?? []).map((s) => ({ value: s.value, label: bilingual(s.label_ro, s.label_en ?? '') })),
  quote: bilingual(existingProject?.quote_ro ?? '', existingProject?.quote_en ?? ''),
  quoteAuthor: existingProject?.quote_author ?? '',
  quoteRole: bilingual(existingProject?.quote_role_ro ?? '', existingProject?.quote_role_en ?? ''),
  quoteCompany: existingProject?.quote_company ?? '',

  published: !!existingProject?.published_at,
  featured: existingProject?.featured ?? false,
})

const titleWarn = computed(() => form.title.ro.length > 60)
const summaryWarn = computed(() => form.summary.ro.length > 200)

const { markSaved: markProjectSaved } = useUnsavedChangesGuard(form)
const revalidatePublicCache = useRevalidatePublicCache()

function addTech() {
  const value = form.techInput.trim()
  if (value && !form.tech.includes(value)) form.tech.push(value)
  form.techInput = ''
}
function removeTech(i: number) {
  form.tech.splice(i, 1)
}
function addStackItem() {
  form.stack.push({ name: '', role: bilingual() })
}
function removeStackItem(i: number) {
  form.stack.splice(i, 1)
}
// Comma-separated editor input -> text[] column.
function splitTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
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
  form.gallery.push({ path: null, altRo: '', altEn: '', aspect: '16/10' })
}
function removeGalleryImage(i: number) {
  form.gallery.splice(i, 1)
}

const dragInfo = ref<{ list: 'facts' | 'stack' | 'stats'; index: number } | null>(null)

function reorderStart(list: 'facts' | 'stack' | 'stats', index: number) {
  dragInfo.value = { list, index }
}
function reorderDrop(list: 'facts' | 'stack' | 'stats', index: number) {
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
    contextBody: form.contextBody,
    serviceTag: form.serviceTag,
    gallery: form.gallery,
  })

  if (issues.length) {
    saveState.value = 'error'
    saveError.value = issues.map((i) => i.message).join(' ')
    return
  }

  saveState.value = 'saving'

  // Single RPC, single transaction: either the whole project saves — project
  // row, facts, stack, stats, gallery, redirect on slug change — or none of it
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
      service_tag: form.serviceTag || null,
      featured: form.featured,
      cover_path: form.coverPath,
      cover_alt_ro: form.coverAlt.ro || null,
      cover_alt_en: form.coverAlt.en || null,
      hero_path: form.heroPath,
      hero_alt_ro: form.heroAlt.ro || null,
      hero_alt_en: form.heroAlt.en || null,
      kind_ro: form.kind.ro || null,
      kind_en: form.kind.en || null,
      tags_ro: splitTags(form.tags.ro),
      tags_en: splitTags(form.tags.en),
      live_url: form.liveUrl.trim() || null,
      live_url_label_ro: form.liveUrlLabel.ro || null,
      live_url_label_en: form.liveUrlLabel.en || null,
      screens_demo: form.screensDemo,
      context_body_ro: form.contextBody.ro || null,
      context_body_en: form.contextBody.en || null,
      solution_body_ro: form.solutionBody.ro || null,
      solution_body_en: form.solutionBody.en || null,
      obstacles_body_ro: form.obstaclesBody.ro || null,
      obstacles_body_en: form.obstaclesBody.en || null,
      changes_body_ro: form.changesBody.ro || null,
      changes_body_en: form.changesBody.en || null,
      result_body_ro: form.resultBody.ro || null,
      result_body_en: form.resultBody.en || null,
      quote_ro: form.quote.ro || null,
      quote_en: form.quote.en || null,
      quote_author: form.quoteAuthor || null,
      quote_role_ro: form.quoteRole.ro || null,
      quote_role_en: form.quoteRole.en || null,
      quote_company: form.quoteCompany || null,
      sort_order: null,
      facts: form.facts.map((f) => ({
        label_ro: f.label.ro,
        label_en: f.label.en || null,
        value_ro: f.value.ro,
        value_en: f.value.en || null,
      })),
      stack: form.stack
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          role_ro: s.role.ro,
          role_en: s.role.en || null,
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
        aspect: img.aspect,
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
  markProjectSaved()

  await revalidatePublicCache()
  await cleanupReplacedMedia()

  if (isNew || form.slugRo.trim() !== slug) {
    await navigateTo(`/admin/projects/${result.slug_ro}`)
  }
}

const MEDIA_BUCKET = 'project-media'

// Runs only after the save succeeds, since the published page may still serve the old files
// until then. A path any other row still references belongs to another project and is kept.
async function cleanupReplacedMedia() {
  const oldPaths = [existingProject?.cover_path, existingProject?.hero_path, ...(existingProject?.project_images?.map((img) => img.path) ?? [])].filter(
    (p): p is string => !!p,
  )
  const newPaths = new Set(
    [form.coverPath, form.heroPath, ...form.gallery.map((g) => g.path)].filter((p): p is string => !!p),
  )
  const removed = oldPaths.filter((p) => !newPaths.has(p))
  if (!removed.length) return

  for (const url of removed) {
    const key = storageKeyFromPublicUrl(url, MEDIA_BUCKET)
    if (!key) continue

    const [projectRefs, imageRefs] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).or(`cover_path.eq.${url},hero_path.eq.${url}`),
      supabase.from('project_images').select('id', { count: 'exact', head: true }).eq('path', url),
    ])
    if (projectRefs.error || imageRefs.error) {
      console.warn('[admin] project save: reference check failed, file kept', url, projectRefs.error ?? imageRefs.error)
      continue
    }
    if ((projectRefs.count ?? 0) > 0 || (imageRefs.count ?? 0) > 0) continue

    const removal = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([key])
      .catch((thrown: unknown) => ({ data: null, error: thrown }))
    if (removal.error) console.warn('[admin] project save: replaced media cleanup failed', key, removal.error)
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
              <AdminField v-model="form.slugRo" label="Slug RO" />
              <AdminField v-model="form.slugEn" label="Slug EN" />
            </div>
            <AdminFieldPair v-model:ro="form.title.ro" v-model:en="form.title.en" label="Titlu (H1 studiu de caz)" required />
            <AdminFieldPair v-model:ro="form.cardTitle.ro" v-model:en="form.cardTitle.en" label="Titlu card (homepage)" required />
            <div>
              <AdminFieldPair v-model:ro="form.summary.ro" v-model:en="form.summary.en" label="Descriere card" textarea required />
              <div class="mt-1 text-right font-mono text-[11px] uppercase tracking-[0.08em]" :class="summaryWarn ? 'text-signal' : 'text-muted'">
                {{ form.summary.ro.length }} / 200
              </div>
            </div>
            <div v-if="titleWarn" class="font-mono text-[11px] uppercase tracking-[0.08em] text-signal">
              Titlul RO depășește 60 de caractere — designul se poate strica.
            </div>
            <AdminFieldPair v-model:ro="form.lead.ro" v-model:en="form.lead.en" label="Lead (sub H1)" textarea required />
            <div class="grid grid-cols-2 gap-4">
              <AdminField v-model="form.year" label="An" />
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
                  >
                </div>
              </div>
            </div>
            <AdminFieldPair v-model:ro="form.kind.ro" v-model:en="form.kind.en" label="Tip proiect (ex. Aplicație web)" />
            <AdminFieldPair v-model:ro="form.tags.ro" v-model:en="form.tags.en" label="Etichete hero (separate prin virgulă)" />
            <AdminField v-model="form.liveUrl" label="Link live (opțional)" />
            <AdminFieldPair v-model:ro="form.liveUrlLabel.ro" v-model:en="form.liveUrlLabel.en" label="Text link live" />
            <div>
              <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Serviciu</div>
              <select v-model="form.serviceTag" class="mt-2 w-full border border-hairline bg-paper px-3 py-2 outline-none focus:border-ink">
                <option :value="null">—</option>
                <option v-for="tag in SERVICE_TAG_IDS" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
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
                <AdminFieldPair v-model:ro="form.coverAlt.ro" v-model:en="form.coverAlt.en" label="Text alternativ copertă" required />
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
                <AdminFieldPair v-model:ro="form.heroAlt.ro" v-model:en="form.heroAlt.en" label="Text alternativ captură principală" required />
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Galerie</div>
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
                    ratio="16/10"
                    :label="`[ galerie ${i + 1} ]`"
                    :path-prefix="`${form.slugRo || 'proiect-nou'}/gallery-${i}`"
                  />
                  <div class="mt-3 flex items-start gap-3">
                    <div class="flex-1">
                      <AdminFieldPair v-model:ro="img.altRo" v-model:en="img.altEn" label="Text alternativ" />
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
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Date</div>
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
                <AdminFieldPair v-model:ro="fact.label.ro" v-model:en="fact.label.en" label="Etichetă" />
                <AdminFieldPair v-model:ro="fact.value.ro" v-model:en="fact.value.en" label="Valoare" />
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

        <!-- Problema -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Problema (secțiunea 01)</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair v-model:ro="form.contextBody.ro" v-model:en="form.contextBody.en" label="Text (paragrafe separate de o linie goală)" textarea required />
          </div>
        </section>

        <!-- Soluția -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Soluția (secțiunea 02)</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair v-model:ro="form.solutionBody.ro" v-model:en="form.solutionBody.en" label="Text (paragrafe separate de o linie goală)" textarea />
            <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
              <input v-model="form.screensDemo" type="checkbox" class="accent-signal" >
              <span :class="form.screensDemo ? 'text-signal' : 'text-muted'">Ecrane cu date demonstrative</span>
            </label>
          </div>
        </section>

        <!-- Stack -->
        <section class="rounded border border-hairline p-6">
          <div class="flex items-center justify-between">
                    <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Stack (secțiunea 03)</div>
            <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.08em] text-signal" @click="addStackItem">
              + Tehnologie
            </button>
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <div
              v-for="(item, i) in form.stack"
              :key="i"
              draggable="true"
              class="flex cursor-grab items-end gap-3 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
              :class="{ 'opacity-40': dragInfo?.list === 'stack' && dragInfo.index === i }"
              @dragstart="reorderStart('stack', i)"
              @dragover.prevent
              @drop="reorderDrop('stack', i)"
            >
              <div class="w-48 flex-none">
                <AdminField v-model="item.name" label="Nume" />
              </div>
              <div class="flex-1">
                <AdminFieldPair v-model:ro="item.role.ro" v-model:en="item.role.en" label="Rol" />
              </div>
              <button type="button" class="mb-2.5 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal" @click="removeStackItem(i)">
                Șterge
              </button>
            </div>
          </div>
        </section>

        <!-- Obstacole -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Obstacole (secțiunea 04)</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair v-model:ro="form.obstaclesBody.ro" v-model:en="form.obstaclesBody.en" label="Text (paragrafe separate de o linie goală)" textarea />
          </div>
        </section>

        <!-- Schimbări -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Schimbări (secțiunea 05)</div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair v-model:ro="form.changesBody.ro" v-model:en="form.changesBody.en" label="Text (paragrafe separate de o linie goală)" textarea />
          </div>
        </section>

        <!-- Rezultat -->
        <section class="rounded border border-hairline p-6">
          <div class="flex items-center justify-between">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Rezultat și feedback (secțiuni 06–07)</div>
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
            <AdminFieldPair v-model:ro="form.resultBody.ro" v-model:en="form.resultBody.en" label="Text rezultat (paragrafe separate de o linie goală)" textarea />
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
                <AdminField v-model="stat.value" label="Valoare" />
              </div>
              <div class="flex-1">
                <AdminFieldPair v-model:ro="stat.label.ro" v-model:en="stat.label.en" label="Etichetă" />
              </div>
              <button type="button" class="mb-2.5 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal" @click="removeStat(i)">
                Șterge
              </button>
            </div>

            <div class="border-t border-hairline pt-4">
              <AdminFieldPair v-model:ro="form.quote.ro" v-model:en="form.quote.en" label="Citat client" textarea />
              <p class="mt-1 text-[13px] text-muted">Dacă citatul lipsește, blocul nu se randează pe site.</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <AdminField v-model="form.quoteAuthor" label="Nume" />
              <AdminFieldPair v-model:ro="form.quoteRole.ro" v-model:en="form.quoteRole.en" label="Funcție" />
              <AdminField v-model="form.quoteCompany" label="Companie" />
            </div>
          </div>
        </section>

        <!-- Publicare -->
        <section class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Publicare</div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap gap-6">
              <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
                <input v-model="form.published" type="checkbox" class="accent-signal" >
                <span :class="form.published ? 'text-signal' : 'text-muted'">
                  {{ form.published ? 'Publicat' : 'Draft' }}
                </span>
              </label>
              <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
                <input v-model="form.featured" type="checkbox" class="accent-signal" >
                <span :class="form.featured ? 'text-signal' : 'text-muted'">Afișat pe homepage</span>
              </label>
            </div>
            <div class="flex gap-3 font-mono text-xs uppercase tracking-[0.08em]">
              <NuxtLink :to="`/proiecte/${form.slugRo}`" class="text-muted hover:text-ink">Vezi pe site</NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
