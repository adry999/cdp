<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'
import type { ProjectForm } from '#layers/projects/domain/projectForm'

// Sections after Rezultat (Adaptare, with its Siguranță list), the gallery texts and the FAQ.
// Each one is shown only when it has content, in both languages independently.
const form = defineModel<ProjectForm>({ required: true })

const locales = ['ro', 'en'] as const

function addQuestion(lang: 'ro' | 'en') {
  form.value.sections.faq[lang].items.push({ q: '', a: '' })
}

function removeQuestion(lang: 'ro' | 'en', index: number) {
  form.value.sections.faq[lang].items.splice(index, 1)
}

function moveQuestion(lang: 'ro' | 'en', index: number, to: number) {
  const faq = form.value.sections.faq[lang]
  if (to < 0 || to >= faq.items.length) return
  faq.items = moveItem(faq.items, index, to)
}
</script>

<template>
  <ProjectsEditorSection title="Secțiuni suplimentare">
    <div class="mt-4 flex flex-col gap-8">
      <section aria-labelledby="sec-adapt" class="flex flex-col gap-4">
        <h3 id="sec-adapt" class="eyebrow text-ink">Adaptare</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang" class="flex flex-col gap-4">
            <AdminField v-model="form.sections.adapt[lang].heading" :label="`Titlu ${lang.toUpperCase()}`" />
            <AdminField v-model="form.sections.adapt[lang].body" as="textarea" rows="3" :label="`Paragraf ${lang.toUpperCase()}`" />
            <ProjectsEditorPairList
              v-model="form.sections.adapt[lang].modules"
              :title="`Module ${lang.toUpperCase()}`"
              first-key="k"
              :first-label="`Titlu (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Modul"
            />
            <ProjectsEditorPairList
              v-model="form.sections.adapt[lang].integrations"
              :title="`Integrări ${lang.toUpperCase()}`"
              first-key="k"
              :first-label="`Titlu (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Integrare"
            />
            <ProjectsEditorPairList
              v-model="form.sections.adapt[lang].safety"
              :title="`Siguranță ${lang.toUpperCase()}`"
              first-key="k"
              :first-label="`Titlu (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Element"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="sec-gallery" class="flex flex-col gap-4">
        <h3 id="sec-gallery" class="eyebrow text-ink">Galerie — titlu, notă și „Ce am livrat”</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang" class="flex flex-col gap-4">
            <AdminField v-model="form.sections.galleryHeading[lang].heading" :label="`Titlu galerie ${lang.toUpperCase()}`" />
            <AdminField v-model="form.sections.galleryHeading[lang].note" :label="`Notă sub galerie ${lang.toUpperCase()}`" />
            <AdminField v-model="form.sections.delivered[lang].label" :label="`Titlu „Ce am livrat” ${lang.toUpperCase()}`" />
            <ProjectsEditorPairList
              v-model="form.sections.delivered[lang].items"
              :title="`Livrabile ${lang.toUpperCase()}`"
              first-key="k"
              :first-label="`Titlu (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Livrabil"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="sec-faq" class="flex flex-col gap-4">
        <h3 id="sec-faq" class="eyebrow text-ink">Întrebări frecvente</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang" class="flex flex-col gap-4">
            <AdminField v-model="form.sections.faq[lang].heading" :label="`Titlu ${lang.toUpperCase()}`" />
            <div>
              <div class="flex items-center justify-between">
                <div class="eyebrow-sm text-muted">{{ `Întrebări ${lang.toUpperCase()}` }}</div>
                <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-signal-text" @click="addQuestion(lang)">
                  + Întrebare
                </button>
              </div>
              <div class="mt-2 flex flex-col gap-3">
                <div
                  v-for="(item, i) in form.sections.faq[lang].items"
                  :key="i"
                  class="flex flex-col gap-2 border-t border-hairline pt-3 first:border-t-0 first:pt-0"
                >
                  <AdminField v-model="item.q" :label="`Întrebare (${lang.toUpperCase()})`" />
                  <AdminField v-model="item.a" as="textarea" rows="3" :label="`Răspuns (${lang.toUpperCase()})`" />
                  <div class="flex gap-3 eyebrow-sm text-muted">
                    <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === 0" :aria-label="`Mută sus: întrebarea ${i + 1} ${lang.toUpperCase()}`" @click="moveQuestion(lang, i, i - 1)">Sus</button>
                    <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-ink" :disabled="i === form.sections.faq[lang].items.length - 1" :aria-label="`Mută jos: întrebarea ${i + 1} ${lang.toUpperCase()}`" @click="moveQuestion(lang, i, i + 1)">Jos</button>
                    <button type="button" class="cursor-pointer border-0 bg-transparent p-0 hover:text-signal-text" :aria-label="`Șterge: întrebarea ${i + 1} ${lang.toUpperCase()}`" @click="removeQuestion(lang, i)">Șterge</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </ProjectsEditorSection>
</template>
