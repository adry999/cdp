<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { emptyBilingual, type ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })

const drag = useDragReorder((from, to) => {
  form.value.stack = moveItem(form.value.stack, from, to)
})

function addStackItem() {
  form.value.stack.push({ name: '', role: emptyBilingual() })
}

function removeStackItem(index: number) {
  form.value.stack.splice(index, 1)
}
</script>

<template>
  <ProjectsEditorSection title="Stack (secțiunea 03)">
    <template #action>
      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-signal" @click="addStackItem">
        + Tehnologie
      </button>
    </template>
    <div class="mt-4 flex flex-col gap-4">
      <div
        v-for="(item, i) in form.stack"
        :key="i"
        draggable="true"
        class="flex cursor-grab items-end gap-3 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
        :class="{ 'opacity-40': drag.isDragging(i) }"
        @dragstart="drag.start(i)"
        @dragover.prevent
        @drop="drag.drop(i)"
      >
        <div class="w-48 flex-none">
          <AdminField v-model="item.name" label="Nume" />
        </div>
        <div class="flex-1">
          <AdminFieldPair v-model:ro="item.role.ro" v-model:en="item.role.en" label="Rol" />
        </div>
        <button type="button" class="mb-2.5 cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-signal" @click="removeStackItem(i)">
          Șterge
        </button>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
