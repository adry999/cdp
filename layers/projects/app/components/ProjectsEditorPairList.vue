<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'

const props = defineProps<{
  title: string
  firstKey: 'v' | 'k'
  firstLabel: string
  secondLabel: string
  addLabel: string
}>()

const items = defineModel<{ v: string; k: string }[]>({ required: true })

const secondKey = computed(() => (props.firstKey === 'v' ? 'k' : 'v'))

function add() {
  items.value.push({ v: '', k: '' })
}

function remove(index: number) {
  items.value.splice(index, 1)
}

function move(index: number, to: number) {
  if (to < 0 || to >= items.value.length) return
  items.value = moveItem(items.value, index, to)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="eyebrow-sm text-muted">{{ title }}</div>
      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-signal-text" @click="add">
        {{ addLabel }}
      </button>
    </div>
    <div class="mt-2 flex flex-col gap-3">
      <div v-for="(item, i) in items" :key="i" class="flex flex-col gap-2 border-t border-hairline pt-3 first:border-t-0 first:pt-0">
        <AdminField v-model="item[firstKey]" :label="firstLabel" />
        <AdminField v-model="item[secondKey]" :label="secondLabel" />
        <div class="flex gap-3 eyebrow-sm text-muted">
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === 0" :aria-label="`Mută sus: ${title} ${i + 1}`" @click="move(i, i - 1)">Sus</button>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === items.length - 1" :aria-label="`Mută jos: ${title} ${i + 1}`" @click="move(i, i + 1)">Jos</button>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-signal-text" :aria-label="`Șterge: ${title} ${i + 1}`" @click="remove(i)">Șterge</button>
        </div>
      </div>
    </div>
  </div>
</template>
