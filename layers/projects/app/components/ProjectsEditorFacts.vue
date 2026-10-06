<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { emptyBilingual, type ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })

const drag = useDragReorder((from, to) => {
  form.value.facts = moveItem(form.value.facts, from, to)
})

function addFact() {
  form.value.facts.push({ label: emptyBilingual(), value: emptyBilingual() })
}

function removeFact(index: number) {
  if (form.value.facts.length > 1) form.value.facts.splice(index, 1)
}
</script>

<template>
  <ProjectsEditorSection title="Date">
    <template #action>
      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-signal-text" @click="addFact">
        + Fapt
      </button>
    </template>
    <div class="mt-4 flex flex-col gap-4">
      <div
        v-for="(fact, i) in form.facts"
        :key="i"
        draggable="true"
        class="flex cursor-grab gap-4 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
        :class="{ 'opacity-40': drag.isDragging(i) }"
        @dragstart="drag.start(i)"
        @dragover.prevent
        @drop="drag.drop(i)"
      >
        <div class="grid flex-1 grid-cols-2 gap-4">
          <AdminFieldPair v-model:ro="fact.label.ro" v-model:en="fact.label.en" label="Etichetă" />
          <AdminFieldPair v-model:ro="fact.value.ro" v-model:en="fact.value.en" label="Valoare" />
        </div>
        <button
          v-if="form.facts.length > 1"
          type="button"
          class="mt-6 h-fit cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-signal-text"
          @click="removeFact(i)"
        >
          Șterge
        </button>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
