<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { emptyBilingual, MAX_STATS, type ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })

const drag = useDragReorder((from, to) => {
  form.value.stats = moveItem(form.value.stats, from, to)
})

function addStat() {
  if (form.value.stats.length < MAX_STATS) form.value.stats.push({ value: '', label: emptyBilingual() })
}

function removeStat(index: number) {
  form.value.stats.splice(index, 1)
}
</script>

<template>
  <ProjectsEditorSection title="Rezultat și feedback (secțiuni 06–07)">
    <template #action>
      <button
        v-if="form.stats.length < MAX_STATS"
        type="button"
        class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-signal"
        @click="addStat"
      >
        + Statistică
      </button>
    </template>
    <div class="mt-4 flex flex-col gap-4">
      <AdminFieldPair v-model:ro="form.resultBody.ro" v-model:en="form.resultBody.en" label="Text rezultat (paragrafe separate de o linie goală)" textarea />
      <div
        v-for="(stat, i) in form.stats"
        :key="i"
        draggable="true"
        class="flex cursor-grab items-end gap-3 border-t border-hairline pt-4 first:border-t-0 first:pt-0"
        :class="{ 'opacity-40': drag.isDragging(i) }"
        @dragstart="drag.start(i)"
        @dragover.prevent
        @drop="drag.drop(i)"
      >
        <div class="w-32 flex-none">
          <AdminField v-model="stat.value" label="Valoare" />
        </div>
        <div class="flex-1">
          <AdminFieldPair v-model:ro="stat.label.ro" v-model:en="stat.label.en" label="Etichetă" />
        </div>
        <button type="button" class="mb-2.5 cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-signal" @click="removeStat(i)">
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
  </ProjectsEditorSection>
</template>
