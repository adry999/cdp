<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'

// project_stats is no longer rendered on the case study (figures live in STAR gains /
// savings), so its editor is hidden; stored rows still round-trip through the form.
const form = defineModel<ProjectForm>({ required: true })
</script>

<template>
  <ProjectsEditorSection title="Rezultat și feedback (secțiunile 04–05)">
    <div class="mt-4 flex flex-col gap-4">
      <AdminFieldPair v-model:ro="form.resultBody.ro" v-model:en="form.resultBody.en" label="Text rezultat (paragrafe separate de o linie goală)" textarea />

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
