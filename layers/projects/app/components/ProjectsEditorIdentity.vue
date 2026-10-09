<script setup lang="ts">
import { SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'
import { moveItem } from '#layers/core/shared/utils/moveItem'
import { emptyBilingual, type ProjectForm } from '#layers/projects/domain/projectForm'
import { LINK_KINDS, type LinkKind } from '#layers/projects/domain/star'

const LINK_KIND_LABELS: Record<LinkKind, string> = {
  live: 'Site live',
  preview: 'Preview CODEPEDIA',
  figma: 'Figma',
}

const form = defineModel<ProjectForm>({ required: true })

const titleWarn = computed(() => form.value.title.ro.length > 60)
const summaryWarn = computed(() => form.value.summary.ro.length > 200)

function addTech() {
  const value = form.value.techInput.trim()
  if (value && !form.value.tech.includes(value)) form.value.tech.push(value)
  form.value.techInput = ''
}

function addLink() {
  form.value.links.push({ kind: 'live', url: '', note: emptyBilingual() })
}

function removeLink(index: number) {
  form.value.links.splice(index, 1)
}

function moveLink(index: number, to: number) {
  if (to < 0 || to >= form.value.links.length) return
  form.value.links = moveItem(form.value.links, index, to)
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
      <div class="grid grid-cols-2 gap-4">
        <AdminFieldPair v-model:ro="form.winValue.ro" v-model:en="form.winValue.en" label="Rezultat pe card — valoare (ex. −35%)" />
        <AdminFieldPair v-model:ro="form.winLabel.ro" v-model:en="form.winLabel.en" label="Rezultat pe card — descriere" />
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
      <div>
        <div class="flex items-center justify-between">
          <div class="eyebrow text-muted">Linkuri</div>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-signal-text" @click="addLink">
            + Link
          </button>
        </div>
        <div class="mt-2 flex flex-col gap-4">
          <div v-for="(link, i) in form.links" :key="i" class="flex flex-col gap-3 border-t border-hairline pt-4 first:border-t-0 first:pt-0">
            <div class="grid grid-cols-[180px_1fr] gap-4">
              <div>
                <label :for="`link-kind-${i}`" class="block eyebrow text-muted">Tip</label>
                <select :id="`link-kind-${i}`" v-model="link.kind" class="mt-2 w-full border border-hairline bg-paper px-3 py-2.5 outline-none focus:border-ink">
                  <option v-for="kind in LINK_KINDS" :key="kind" :value="kind">{{ LINK_KIND_LABELS[kind] }}</option>
                </select>
              </div>
              <AdminField v-model="link.url" :label="`URL link ${i + 1}`" type="url" />
            </div>
            <AdminFieldPair v-model:ro="link.note.ro" v-model:en="link.note.en" :label="`Notă link ${i + 1} (opțional)`" />
            <div class="flex gap-3 eyebrow-sm text-muted">
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === 0" :aria-label="`Mută sus link ${i + 1}`" @click="moveLink(i, i - 1)">Sus</button>
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === form.links.length - 1" :aria-label="`Mută jos link ${i + 1}`" @click="moveLink(i, i + 1)">Jos</button>
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-signal-text" :aria-label="`Șterge link ${i + 1}`" @click="removeLink(i)">Șterge</button>
            </div>
          </div>
        </div>
      </div>
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
