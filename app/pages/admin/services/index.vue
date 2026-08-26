<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()

const { data: rows } = await useAsyncData('admin-services', async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*, service_items(*)')
    .order('sort_order')
    .order('sort_order', { foreignTable: 'service_items' })
  if (error) throw error
  return data ?? []
})

const levels = reactive(
  (rows.value ?? []).map((row) => ({
    id: row.id,
    heading: { ro: row.heading_ro, en: row.heading_en ?? '' },
    body: { ro: row.body_ro, en: row.body_en ?? '' },
    duration: { ro: row.duration_ro ?? '', en: row.duration_en ?? '' },
    priceFrom: row.price_from != null ? String(row.price_from) : '',
    levelLabel: { ro: row.level_label_ro, en: row.level_label_en ?? '' },
    name: { ro: row.name_ro, en: row.name_en ?? '' },
    items: row.service_items.map((it) => ({
      id: it.id,
      label: { ro: it.label_ro, en: it.label_en ?? '' },
      body: { ro: it.body_ro, en: it.body_en ?? '' },
    })),
  })),
)

const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const { markSaved } = useUnsavedChangesGuard(levels)
const revalidatePublicCache = useRevalidatePublicCache()

async function save() {
  saveState.value = 'saving'
  try {
    for (const level of levels) {
      const { error } = await supabase
        .from('services')
        .update({
          heading_ro: level.heading.ro,
          heading_en: level.heading.en || null,
          body_ro: level.body.ro,
          body_en: level.body.en || null,
          duration_ro: level.duration.ro || null,
          duration_en: level.duration.en || null,
          price_from: level.priceFrom ? Number(level.priceFrom) : null,
        })
        .eq('id', level.id)
      if (error) throw error

      for (const [j, item] of level.items.entries()) {
        const { error: itemError } = await supabase
          .from('service_items')
          .update({
            label_ro: item.label.ro,
            label_en: item.label.en || null,
            body_ro: item.body.ro,
            body_en: item.body.en || null,
            sort_order: j,
          })
          .eq('id', item.id)
        if (itemError) throw itemError
      }
    }
    saveState.value = 'saved'
    markSaved()
    await revalidatePublicCache()
  } catch {
    saveState.value = 'error'
  }
}

const dragInfo = ref<{ levelIndex: number; itemIndex: number } | null>(null)

function reorderStart(levelIndex: number, itemIndex: number) {
  dragInfo.value = { levelIndex, itemIndex }
}
function reorderDrop(levelIndex: number, itemIndex: number) {
  if (!dragInfo.value || dragInfo.value.levelIndex !== levelIndex || dragInfo.value.itemIndex === itemIndex) return
  const items = levels[levelIndex].items
  const [moved] = items.splice(dragInfo.value.itemIndex, 1)
  items.splice(itemIndex, 0, moved)
  dragInfo.value = null
}
</script>

<template>
  <div>
    <AdminTopbar title="Servicii">
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
        <section v-for="(level, i) in levels" :key="level.id" class="rounded border border-hairline p-6">
          <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">
            {{ level.levelLabel.ro }} / {{ level.name.ro }}
          </div>
          <div class="mt-4 flex flex-col gap-4">
            <AdminFieldPair label="Titlu" v-model:ro="level.heading.ro" v-model:en="level.heading.en" required />
            <AdminFieldPair label="Descriere" textarea v-model:ro="level.body.ro" v-model:en="level.body.en" />
            <AdminFieldPair label="Durată" v-model:ro="level.duration.ro" v-model:en="level.duration.en" />
            <AdminField label="Preț de la (EUR)" type="number" v-model="level.priceFrom" />
          </div>

          <div class="mt-6 border-t border-hairline pt-5">
            <div class="font-mono text-xs uppercase tracking-[0.08em] text-muted">Itemi</div>
            <div class="mt-3 flex flex-col">
              <div
                v-for="(item, j) in level.items"
                :key="item.id"
                draggable="true"
                class="flex cursor-grab flex-col gap-3 border-t border-hairline py-4"
                :class="{
                  'border-b': j === level.items.length - 1,
                  'opacity-40': dragInfo?.levelIndex === i && dragInfo.itemIndex === j,
                }"
                @dragstart="reorderStart(i, j)"
                @dragover.prevent
                @drop="reorderDrop(i, j)"
              >
                <AdminFieldPair label="Etichetă" v-model:ro="item.label.ro" v-model:en="item.label.en" />
                <AdminFieldPair label="Descriere" textarea v-model:ro="item.body.ro" v-model:en="item.body.en" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
