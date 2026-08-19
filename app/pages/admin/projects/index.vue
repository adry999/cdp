<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()

const { data: rows, refresh } = await useAsyncData('admin-projects', async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('slug_ro, card_title_ro, tech, published_at, sort_order')
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
  await supabase.from('projects').delete().eq('slug_ro', slug)
  pendingDelete.value = null
  busy.value = null
  await refresh()
}

const CHILD_TABLES = ['project_facts', 'project_steps', 'project_stats', 'project_images'] as const

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

  const { id, created_at, updated_at, preview_token, ...rest } = project
  const { data: created, error } = await supabase
    .from('projects')
    .insert({
      ...rest,
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

  for (const table of CHILD_TABLES) {
    const { data: children } = await supabase.from(table).select('*').eq('project_id', id)
    if (children?.length) {
      await supabase.from(table).insert(
        children.map(({ id: _childId, ...c }) => ({ ...c, project_id: created.id })),
      )
    }
  }

  busy.value = null
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
      <div class="mb-4 flex gap-2 font-mono text-xs uppercase tracking-[0.08em]">
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

      <div v-if="!filtered.length" class="rounded border border-hairline p-8 text-center text-muted">
        Niciun proiect.
      </div>
      <div v-else class="flex flex-col">
        <div
          v-for="(project, i) in filtered"
          :key="project.slug_ro"
          class="flex flex-wrap items-center gap-4 border-t border-hairline py-3"
          :class="{ 'border-b': i === filtered.length - 1 }"
        >
          <div class="h-[30px] w-12 flex-none rounded border border-hairline" :style="thumbnailStyle" />
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
