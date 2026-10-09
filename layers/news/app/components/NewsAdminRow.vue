<script setup lang="ts">
import type { AdminNewsListRow } from '#layers/news/domain/newsSelect'

defineProps<{ item: AdminNewsListRow; last: boolean; confirming: boolean; busy: boolean }>()
defineEmits<{ askDelete: []; cancelDelete: []; confirmDelete: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-4 border-t border-hairline py-3" :class="{ 'border-b': last }">
    <NuxtLink
      :to="`/admin/news/${item.slug_ro}`"
      class="min-w-0 flex-[2_1_220px] text-[15px] text-ink no-underline hover:text-signal-text hover:no-underline"
    >
      {{ item.title_ro }}
    </NuxtLink>
    <div class="min-w-0 flex-[1_1_140px] truncate text-[15px] text-muted">{{ item.source_name || '—' }}</div>
    <div class="flex-[0_0_90px] eyebrow" :class="item.published_at ? 'text-signal-text' : 'text-muted'">
      {{ item.published_at ? 'Publicat' : 'Draft' }}
    </div>
    <div class="flex-[0_0_100px] eyebrow text-muted">
      {{ new Date(item.published_at ?? item.created_at).toLocaleDateString('ro-RO') }}
    </div>
    <div class="flex flex-[0_0_150px] justify-end gap-3 eyebrow">
      <template v-if="confirming">
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-signal-text" :disabled="busy" @click="$emit('confirmDelete')">
          {{ busy ? 'Șterge…' : 'Sigur? Șterge' }}
        </button>
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted" @click="$emit('cancelDelete')">Anulează</button>
      </template>
      <template v-else>
        <NuxtLink :to="`/admin/news/${item.slug_ro}`" class="text-muted hover:text-ink">Editează</NuxtLink>
        <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal-text" @click="$emit('askDelete')">
          Șterge
        </button>
      </template>
    </div>
  </div>
</template>
