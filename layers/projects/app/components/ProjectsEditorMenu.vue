<script setup lang="ts">
import { SERVICE_TAG_IDS, SERVICE_TAG_LABELS_RO } from '#layers/core/shared/types/service-tag'
import type { MenuPreviewGroup } from '#layers/projects/domain/menuPreview'
import type { ProjectForm } from '#layers/projects/domain/projectForm'

// The fields the "Servicii" menu reads, beside the preview of that menu: a tick shows up at once.
const form = defineModel<ProjectForm>({ required: true })
defineProps<{ groups: MenuPreviewGroup[] }>()

const serviceId = useId()
</script>

<template>
  <ProjectsEditorSection section="meniu">
    <div class="mt-4 grid grid-fit-safe-300 items-start gap-6">
      <div class="flex flex-col gap-4">
        <div>
          <label :for="serviceId" class="block eyebrow text-muted">Serviciu</label>
          <select
            :id="serviceId"
            v-model="form.serviceTag"
            class="mt-2 w-full border border-muted bg-paper px-3 py-2 focus:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <option :value="null">—</option>
            <option v-for="tag in SERVICE_TAG_IDS" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </div>
        <fieldset class="m-0 min-w-0 border-0 p-0">
          <legend class="p-0 eyebrow text-muted">Apare în meniu la</legend>
          <div class="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            <label v-for="tag in SERVICE_TAG_IDS" :key="tag" class="flex min-h-11 items-center gap-2 text-sm nav:min-h-8">
              <input v-model="form.navServices" type="checkbox" :value="tag" class="accent-signal">
              {{ SERVICE_TAG_LABELS_RO[tag] }}
            </label>
          </div>
          <p class="m-0 mt-2 text-xs text-muted">
            Meniul „Servicii” afișează maximum 4 proiecte publicate per serviciu, cele de pe homepage primele.
          </p>
        </fieldset>
      </div>
      <ProjectsEditorMenuPreview :groups="groups" :published="form.published" />
    </div>
  </ProjectsEditorSection>
</template>
