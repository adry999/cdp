<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()

const { data: rows, refresh } = await useAsyncData('admin-projects', async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('slug_ro, card_title_ro, tech, cover_path, published_at, sort_order')
    .order('sort_order')
  if (error) throw error
  return data ?? []
})

const filter = ref<'toate' | 'draft' | 'publicate'>('toate')
const filtered = computed(() => {
  if (filter.value === 'draft') return (rows.value ?? []).filter((r) => !r.published_at)
  if (filter.value === 'publicate') return (rows.value ?? []).filter((r) => !!r.published_at)
  return rows.value ?? []
})
// sort_order is a global ordering; reordering a filtered subset would leave
// the other rows' positions ambiguous, so drag reorder only applies to the
// unfiltered list.
const canReorder = computed(() => filter.value === 'toate')

const dragIndex = ref<number | null>(null)
const reordering = ref(false)
const reorderError = ref(false)
const revalidatePublicCache = useRevalidatePublicCache()

function onDragStart(i: number) {
  if (!canReorder.value) return
  dragIndex.value = i
}

async function onDrop(i: number) {
  if (!canReorder.value || dragIndex.value === null || dragIndex.value === i || !rows.value) return
  const list = rows.value
  const [moved] = list.splice(dragIndex.value, 1)
  list.splice(i, 0, moved)
  dragIndex.value = null

  reordering.value = true
  reorderError.value = false
  const results = await Promise.all(
    list.map((project, idx) => supabase.from('projects').update({ sort_order: idx }).eq('slug_ro', project.slug_ro)),
  )
  reorderError.value = results.some((r) => r.error)
  reordering.value = false
  if (!reorderError.value) await revalidatePublicCache()
}

const thumbnailStyle = {
  backgroundImage:
    'url(/brand/codepedia-mark-watermark.svg), repeating-linear-gradient(45deg, var(--color-hatch) 0 1px, transparent 1px 7px)',
  backgroundRepeat: 'no-repeat, repeat',
  backgroundPosition: 'center 44%, 0 0',
  backgroundSize: '20px auto, auto',
}

const pendingDelete = ref<string | null>(null)
const busy = ref<string | null>(null)

function askDelete(slug: string) {
  pendingDelete.value = slug
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete(slug: string) {
  busy.value = slug

  // Read the image paths (and slugs, for redirect cleanup below) before the
  // row — and its child project_images rows, cascade-deleted with it — is
  // gone, or there's nothing left to clean up from.
  const { data: project } = await supabase
    .from('projects')
    .select('slug_ro, slug_en, cover_path, hero_path, project_images(path)')
    .eq('slug_ro', slug)
    .single()

  const { error } = await supabase.from('projects').delete().eq('slug_ro', slug)
  if (error) {
    busy.value = null
    return
  }

  // Deleting the project doesn't delete redirects that point *at* it — a
  // project renamed once, then deleted, otherwise leaves a 301 chaining into
  // a 404. save_project() does this same cleanup when a save unpublishes;
  // deletion needs its own, since it never goes through that RPC.
  if (project) {
    await supabase
      .from('redirects')
      .delete()
      .or(`to_path.eq./proiecte/${project.slug_ro},to_path.eq./en/work/${project.slug_en ?? project.slug_ro}`)
  }

  if (project) {
    // Skip a URL still referenced by another project — protects any project
    // duplicated before duplicate() was fixed to copy media independently
    // instead of reusing the source's Storage keys.
    const urls = [project.cover_path, project.hero_path, ...project.project_images.map((i) => i.path)].filter(
      (url): url is string => !!url,
    )
    const keys: string[] = []
    for (const url of urls) {
      const [{ count: projectCount }, { count: imageCount }] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).or(`cover_path.eq.${url},hero_path.eq.${url}`),
        supabase.from('project_images').select('id', { count: 'exact', head: true }).eq('path', url),
      ])
      if ((projectCount ?? 0) === 0 && (imageCount ?? 0) === 0) {
        const key = storageKeyFromPublicUrl(url, 'project-media')
        if (key) keys.push(key)
      }
    }
    if (keys.length) await supabase.storage.from('project-media').remove(keys).catch(() => {})
  }

  pendingDelete.value = null
  busy.value = null
  await revalidatePublicCache()
  await refresh()
}

const CHILD_TABLES = ['project_facts', 'project_steps', 'project_stats', 'project_images'] as const
const MEDIA_BUCKET = 'project-media'

// Copies the underlying Storage object rather than reusing its URL. The
// previous version pointed the duplicate's cover/hero/gallery fields at the
// exact same Storage keys as the source project — deleting either project,
// or replacing an image in either one, then deleted a file the other project
// still displayed. Independent files restore the "one URL belongs to one
// project" assumption the rest of the admin (delete cleanup, replace
// cleanup) already relies on.
async function copyMedia(url: string | null, newPrefix: string): Promise<string | null> {
  if (!url) return null
  const oldKey = storageKeyFromPublicUrl(url, MEDIA_BUCKET)
  if (!oldKey) return null
  const ext = oldKey.split('.').pop() || 'jpg'
  const newKey = `${newPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).copy(oldKey, newKey)
  if (error) return null
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(newKey).data.publicUrl
}

async function duplicate(slug: string) {
  busy.value = slug
  const { data: project } = await supabase.from('projects').select('*').eq('slug_ro', slug).single()
  if (!project) {
    busy.value = null
    return
  }

  let newSlug = `${slug}-copie`
  let n = 2
  while ((await supabase.from('projects').select('id').eq('slug_ro', newSlug).maybeSingle()).data) {
    newSlug = `${slug}-copie-${n++}`
  }

  const { id, created_at, updated_at, preview_token, cover_path, hero_path, ...rest } = project
  const [newCoverPath, newHeroPath] = await Promise.all([
    copyMedia(cover_path, `${newSlug}/cover`),
    copyMedia(hero_path, `${newSlug}/hero`),
  ])

  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      ...rest,
      cover_path: newCoverPath,
      hero_path: newHeroPath,
      slug_ro: newSlug,
      slug_en: newSlug,
      card_title_ro: `${project.card_title_ro} (copie)`,
      published_at: null,
    })
    .select('id')
    .single()

  if (error || !created) {
    busy.value = null
    return
  }

  let childError = false
  for (const table of CHILD_TABLES) {
    const { data: children } = await supabase.from(table).select('*').eq('project_id', id)
    if (!children?.length) continue

    const rows = await Promise.all(
      children.map(async (child) => {
        const { id: _childId, ...c } = child as Record<string, unknown> & { id: string }
        if (table === 'project_images' && typeof c.path === 'string') {
          c.path = (await copyMedia(c.path, `${newSlug}/gallery`)) ?? c.path
        }
        return { ...c, project_id: created.id }
      }),
    )
    const { error: insertError } = await supabase.from(table).insert(rows)
    if (insertError) childError = true
  }

  busy.value = null
  // Best-effort duplication landed, but not everything copied cleanly —
  // surfacing this beats a silent partial copy the admin doesn't know about.
  if (childError) window.alert('Proiectul a fost duplicat, dar unele elemente nu s-au copiat corect. Verifică proiectul nou.')
  await refresh()
}
</script>

<template>
  <div>
    <AdminTopbar title="Proiecte">
      <template #actions>
        <AppButton variant="ink" href="/admin/projects/nou">Proiect nou</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 px-6 py-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-2 font-mono text-xs uppercase tracking-[0.08em]">
          <button
            v-for="opt in (['toate', 'draft', 'publicate'] as const)"
            :key="opt"
            type="button"
            class="cursor-pointer rounded border px-3 py-1.5"
            :class="filter === opt ? 'border-ink bg-ink text-paper' : 'border-hairline text-muted hover:border-ink hover:text-ink'"
            @click="filter = opt"
          >
            {{ opt }}
          </button>
        </div>
        <span
          v-if="canReorder"
          class="font-mono text-[11px] uppercase tracking-[0.08em]"
          :class="reorderError ? 'text-signal' : 'text-muted-ink'"
        >
          {{ reorderError ? 'Ordinea nu s-a salvat — reîncearcă' : reordering ? 'Se salvează ordinea…' : 'Trage ⠿ pentru a reordona' }}
        </span>
      </div>

      <div v-if="!filtered.length" class="rounded border border-hairline p-8 text-center text-muted">
        Niciun proiect.
      </div>
      <div v-else class="flex flex-col">
        <div
          v-for="(project, i) in filtered"
          :key="project.slug_ro"
          :draggable="canReorder"
          class="flex flex-wrap items-center gap-4 border-t border-hairline py-3"
          :class="[{ 'border-b': i === filtered.length - 1 }, canReorder ? 'cursor-grab' : undefined, dragIndex === i ? 'opacity-40' : undefined]"
          @dragstart="onDragStart(i)"
          @dragover.prevent
          @drop="onDrop(i)"
        >
          <span v-if="canReorder" aria-hidden="true" class="flex-none font-mono text-xs text-muted">⠿</span>
          <img
            v-if="project.cover_path"
            :src="project.cover_path"
            alt=""
            class="h-[30px] w-12 flex-none rounded border border-hairline object-cover"
          />
          <div v-else class="h-[30px] w-12 flex-none rounded border border-hairline" :style="thumbnailStyle" />
          <div class="min-w-0 flex-[2_1_200px] text-[15px]">{{ project.card_title_ro }}</div>
          <div class="flex flex-[1_1_160px] flex-wrap gap-1.5">
            <TechChip v-for="tech in project.tech" :key="tech" :label="tech" />
          </div>
          <div
            class="flex-[0_0_90px] font-mono text-xs uppercase tracking-[0.08em]"
            :class="project.published_at ? 'text-signal' : 'text-muted'"
          >
            {{ project.published_at ? 'Publicat' : 'Draft' }}
          </div>
          <div class="flex-[0_0_100px] font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {{ project.published_at ? new Date(project.published_at).toLocaleDateString('ro-RO') : '—' }}
          </div>
          <div class="flex flex-[0_0_180px] justify-end gap-3 font-mono text-xs uppercase tracking-[0.08em]">
            <template v-if="pendingDelete === project.slug_ro">
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 text-signal"
                :disabled="busy === project.slug_ro"
                @click="confirmDelete(project.slug_ro)"
              >
                {{ busy === project.slug_ro ? 'Șterge…' : 'Sigur? Șterge' }}
              </button>
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted" @click="cancelDelete">
                Anulează
              </button>
            </template>
            <template v-else>
              <NuxtLink :to="`/admin/projects/${project.slug_ro}`" class="text-muted hover:text-ink">Editează</NuxtLink>
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-ink"
                :disabled="busy === project.slug_ro"
                @click="duplicate(project.slug_ro)"
              >
                Duplică
              </button>
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal"
                @click="askDelete(project.slug_ro)"
              >
                Șterge
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
