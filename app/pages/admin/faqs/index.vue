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
  })),
)

function addItem() {
  items.push({
    key: crypto.randomUUID(),
    id: null,
    question: { ro: '', en: '' },
    answer: { ro: '', en: '' },
    published: false,
  })
}

const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

async function save() {
  saveState.value = 'saving'
  try {
    for (const [i, item] of items.entries()) {
      const payload = {
        question_ro: item.question.ro,
        question_en: item.question.en || null,
        answer_ro: item.answer.ro,
        answer_en: item.answer.en || null,
        sort_order: i,
        published_at: item.published ? new Date().toISOString() : null,
      }
      if (item.id) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', item.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('faqs').insert(payload).select('id').single()
        if (error) throw error
        item.id = data.id
      }
    }
    saveState.value = 'saved'
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

  for (const [idx, item] of items.entries()) {
    if (item.id) await supabase.from('faqs').update({ sort_order: idx }).eq('id', item.id)
  }
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
            <label class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
              <input v-model="item.published" type="checkbox" class="accent-signal" />
              <span :class="item.published ? 'text-signal' : 'text-muted'">
                {{ item.published ? 'Publicat' : 'Draft' }}
              </span>
            </label>
          </div>
          <AdminFieldPair label="Întrebare" v-model:ro="item.question.ro" v-model:en="item.question.en" required />
          <AdminFieldPair label="Răspuns" textarea v-model:ro="item.answer.ro" v-model:en="item.answer.en" required />
        </div>
      </div>
    </div>
  </div>
</template>
