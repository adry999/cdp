<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'

// The midway incident is no longer on the case study, so its editor is hidden;
// stored values still round-trip through the form.
const form = defineModel<ProjectForm>({ required: true })

const locales = ['ro', 'en'] as const
</script>

<template>
  <ProjectsEditorSection title="STAR">
    <div class="mt-4 flex flex-col gap-8">
      <section aria-labelledby="star-s" class="flex flex-col gap-4">
        <h3 id="star-s" class="eyebrow text-ink">Situație — Cât costa problema</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang">
            <ProjectsEditorPairList
              v-model="form.star.cost[lang]"
              :title="`Cifre ${lang.toUpperCase()}`"
              first-key="v"
              :first-label="`Valoare (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Cifră"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="star-t" class="flex flex-col gap-4">
        <h3 id="star-t" class="eyebrow text-ink">Sarcină</h3>
        <AdminFieldPair v-model:ro="form.star.goal.ro" v-model:en="form.star.goal.en" label="Obiectiv" textarea />
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang">
            <ProjectsEditorPairList
              v-model="form.star.constraints[lang]"
              :title="`Constrângeri ${lang.toUpperCase()}`"
              first-key="k"
              :first-label="`Constrângere (${lang.toUpperCase()})`"
              :second-label="`Valoare (${lang.toUpperCase()})`"
              add-label="+ Constrângere"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="star-a" class="flex flex-col gap-4">
        <h3 id="star-a" class="eyebrow text-ink">Acțiune — Decizii de business</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="lang">
            <ProjectsEditorTextList
              v-model="form.star.biz[lang]"
              :title="`Decizii ${lang.toUpperCase()}`"
              :item-label="`Decizie ${lang.toUpperCase()}`"
              add-label="+ Decizie"
            />
          </div>
        </div>
      </section>


      <section aria-labelledby="star-r" class="flex flex-col gap-4">
        <h3 id="star-r" class="eyebrow text-ink">Rezultat</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="lang in locales" :key="`g-${lang}`">
            <ProjectsEditorPairList
              v-model="form.star.gains[lang]"
              :title="`+ Câștig ${lang.toUpperCase()}`"
              first-key="v"
              :first-label="`Valoare (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Câștig"
            />
          </div>
          <div v-for="lang in locales" :key="`s-${lang}`">
            <ProjectsEditorPairList
              v-model="form.star.savings[lang]"
              :title="`− Economii ${lang.toUpperCase()}`"
              first-key="v"
              :first-label="`Valoare (${lang.toUpperCase()})`"
              :second-label="`Descriere (${lang.toUpperCase()})`"
              add-label="+ Economie"
            />
          </div>
        </div>
      </section>
    </div>
  </ProjectsEditorSection>
</template>
