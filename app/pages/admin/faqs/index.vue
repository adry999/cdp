<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()

const { data: rows } = await useAsyncData('admin-faqs', async () => {
  const { data, error } = await supabase.from('faqs').select('*').order('sort_order')
  if (error) throw error
  return data ?? []
})

const items = reactive(
  (rows.value ?? []).map((r) => ({
    key: r.id as string,
    id: r.id as string | null,
    question: { ro: r.question_ro, en: r.question_en ?? '' },
    answer: { ro: r.answer_ro, en: r.answer_en ?? '' },
    published: !!r.published_at,
    // The date a question was first published shouldn't move just because
    // the page got saved again — only a genuine unpublished -> published
    // transition should stamp a new date.
    publishedAt: r.published_at as string | null,
  })),
)

const { markSaved } = useUnsavedChangesGuard(items)

function addItem() {
  items.push({
    key: crypto.randomUUID(),
    id: null,
    question: { ro: '', en: '' },
    answer: { ro: '', en: '' },
    published: false,
    publishedAt: null,
  })
}

async function removeItem(i: number) {
  const item = items[i]
  if (!item) return
  if (!window.confirm('Ștergi această întrebare definitiv?')) return
  if (item.id) {
    const { error } = await supabase.from('faqs').delete().eq('id', item.id)
    if (error) return
  }
  items.splice(i, 1)
}

const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

async function save() {
  saveState.value = 'saving'
  try {
    for (const [i, item] of items.entries()) {
      const publishedAt = item.published ? (item.publishedAt ?? new Date().toISOString()) : null
      const payload = {
        question_ro: item.question.ro,
        question_en: item.question.en || null,
        answer_ro: item.answer.ro,
        answer_en: item.answer.en || null,
        sort_order: i,
        published_at: publishedAt,
      }
      if (item.id) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', item.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('faqs').insert(payload).select('id').single()
        if (error) throw error
        item.id = data.id
      }
      item.publishedAt = publishedAt
    }
    saveState.value = 'saved'
    markSaved()
  } catch {
    saveState.value = 'error'
  }
}

const dragIndex = ref<number | null>(null)

function onDragStart(i: number) {
  dragIndex.value = i
}
async function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const [moved] = items.splice(dragIndex.value, 1)
  items.splice(i, 0, moved)
  dragIndex.value = null

  // A single batched upsert instead of N sequential awaited updates — a
  // failure partway through no longer leaves the order half-applied, and
  // errors are no longer silently dropped.
  const reordered = items.filter((item): item is typeof item & { id: string } => !!item.id)
  if (!reordered.length) return
  await supabase.from('faqs').upsert(
    reordered.map((item, idx) => ({
      id: item.id,
      question_ro: item.question.ro,
      question_en: item.question.en || null,
      answer_ro: item.answer.ro,
      answer_en: item.answer.en || null,
      sort_order: idx,
      published_at: item.publishedAt,
    })),
  )
  // The reorder just persisted, but the unsaved-changes guard's snapshot was
  // taken at page load and doesn't know that — without this, navigating away
  // right after a drag would falsely prompt "unsaved changes" for a change
  // that's already saved.
  markSaved()
}
</script>

<template>
  <div>
    <AdminTopbar title="Întrebări">
      <template #actions>
        <span
          v-if="saveState !== 'idle'"
          class="font-mono text-xs uppercase tracking-[0.08em]"
          :class="saveState === 'error' ? 'text-signal' : 'text-muted'"
        >
          {{ { saving: 'Se salvează…', saved: 'Salvat', error: 'Eroare la salvare' }[saveState] }}
        </span>
        <AppButton variant="outline" @click="addItem">Întrebare nouă</AppButton>
        <AppButton variant="ink" @click="save">Salvează</AppButton>
      </template>
    </AdminTopbar>

    <div class="flex-1 overflow-y-auto px-6 py-6">
      <div class="flex max-w-[880px] flex-col">
        <div
          v-for="(item, i) in items"
          :key="item.key"
          draggable="true"
          class="flex flex-col gap-4 border-t border-hairline py-5"
          :class="{ 'border-b': i === items.length - 1, 'opacity-40': dragIndex === i }"
          @dragstart="onDragStart(i)"
          @dragover.prevent
          @drop="onDrop(i)"
        >
          <div class="flex items-center justify-between">
            <span class="flex cursor-grab items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-muted">
              <span aria-hidden="true">⠿</span>
              Întrebarea {{ i + 1 }}
            </span>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
                <input v-model="item.published" type="checkbox" class="accent-signal" />
                <span :class="item.published ? 'text-signal' : 'text-muted'">
                  {{ item.published ? 'Publicat' : 'Draft' }}
                </span>
              </label>
              <button
                type="button"
                class="cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted hover:text-signal"
                @click="removeItem(i)"
              >
                Șterge
              </button>
            </div>
          </div>
          <AdminFieldPair label="Întrebare" v-model:ro="item.question.ro" v-model:en="item.question.en" required />
          <AdminFieldPair label="Răspuns" textarea v-model:ro="item.answer.ro" v-model:en="item.answer.en" required />
        </div>
      </div>
    </div>
  </div>
</template>
