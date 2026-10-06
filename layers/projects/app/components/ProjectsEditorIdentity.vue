<script setup lang="ts">
import { SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'
import type { ProjectForm } from '#layers/projects/domain/projectForm'

const form = defineModel<ProjectForm>({ required: true })

const titleWarn = computed(() => form.value.title.ro.length > 60)
const summaryWarn = computed(() => form.value.summary.ro.length > 200)

function addTech() {
  const value = form.value.techInput.trim()
  if (value && !form.value.tech.includes(value)) form.value.tech.push(value)
  form.value.techInput = ''
}

function removeTech(index: number) {
  form.value.tech.splice(index, 1)
}
</script>

<template>
  <ProjectsEditorSection title="Identitate">
    <div class="mt-4 flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-4">
        <AdminField v-model="form.slugRo" label="Slug RO" />
        <AdminField v-model="form.slugEn" label="Slug EN" />
      </div>
      <AdminFieldPair v-model:ro="form.title.ro" v-model:en="form.title.en" label="Titlu (H1 studiu de caz)" required />
      <AdminFieldPair v-model:ro="form.cardTitle.ro" v-model:en="form.cardTitle.en" label="Titlu card (homepage)" required />
      <div>
        <AdminFieldPair v-model:ro="form.summary.ro" v-model:en="form.summary.en" label="Descriere card" textarea required />
        <div class="mt-1 text-right eyebrow-sm" :class="summaryWarn ? 'text-signal-text' : 'text-muted'">
          {{ form.summary.ro.length }} / 200
        </div>
      </div>
      <div v-if="titleWarn" class="eyebrow-sm text-signal-text">
        Titlul RO depășește 60 de caractere — designul se poate strica.
      </div>
      <AdminFieldPair v-model:ro="form.lead.ro" v-model:en="form.lead.en" label="Lead (sub H1)" textarea required />
      <div class="grid grid-cols-2 gap-4">
        <AdminField v-model="form.year" label="An" />
        <div>
          <div class="eyebrow text-muted">Tech</div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <TechChip v-for="(tech, i) in form.tech" :key="tech">
              {{ tech }}
              <button type="button" class="ml-1.5 cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-signal-text" @click="removeTech(i)">×</button>
            </TechChip>
            <input
              v-model="form.techInput"
              placeholder="+ enter"
              class="w-24 border-0 border-b border-hairline bg-transparent py-1 text-sm outline-none focus:border-ink"
              @keydown.enter.prevent="addTech"
            >
          </div>
        </div>
      </div>
      <AdminFieldPair v-model:ro="form.kind.ro" v-model:en="form.kind.en" label="Tip proiect (ex. Aplicație web)" />
      <AdminFieldPair v-model:ro="form.tags.ro" v-model:en="form.tags.en" label="Etichete hero (separate prin virgulă)" />
      <AdminField v-model="form.liveUrl" label="Link live (opțional)" />
      <AdminFieldPair v-model:ro="form.liveUrlLabel.ro" v-model:en="form.liveUrlLabel.en" label="Text link live" />
      <div>
        <div class="eyebrow text-muted">Serviciu</div>
        <select v-model="form.serviceTag" class="mt-2 w-full border border-hairline bg-paper px-3 py-2 outline-none focus:border-ink">
          <option :value="null">—</option>
          <option v-for="tag in SERVICE_TAG_IDS" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
