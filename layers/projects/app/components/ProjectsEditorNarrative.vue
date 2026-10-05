<script setup lang="ts">
import type { Bilingual } from '#layers/projects/domain/projectForm'

defineProps<{ title: string; required?: boolean }>()

const body = defineModel<Bilingual>({ required: true })
</script>

<template>
  <ProjectsEditorSection :title="title">
    <div class="mt-4 flex flex-col gap-4">
      <AdminFieldPair
        v-model:ro="body.ro"
        v-model:en="body.en"
        label="Text (paragrafe separate de o linie goală)"
        textarea
        :required="required"
      />
      <slot />
    </div>
  </ProjectsEditorSection>
</template>
