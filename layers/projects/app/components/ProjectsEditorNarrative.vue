<script setup lang="ts">
import type { ProjectEditorSectionId } from '#layers/projects/domain/editorSections'
import type { Bilingual } from '#layers/projects/domain/projectForm'

defineProps<{ section: ProjectEditorSectionId; required?: boolean; invalid?: boolean }>()

const body = defineModel<Bilingual>({ required: true })
</script>

<template>
  <ProjectsEditorSection :section="section">
    <div class="mt-4 flex flex-col gap-4">
      <AdminFieldPair
        v-model:ro="body.ro"
        v-model:en="body.en"
        label="Text (paragrafe separate de o linie goală)"
        textarea
        :required="required"
        :invalid="invalid"
      />
      <slot />
    </div>
  </ProjectsEditorSection>
</template>
