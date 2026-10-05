<script setup lang="ts">
import type { ProjectForm } from '#layers/projects/domain/projectForm'
import { MEDIA_BUCKET } from '#layers/projects/domain/storagePath'

const form = defineModel<ProjectForm>({ required: true })

const pathPrefix = computed(() => form.value.slugRo || 'proiect-nou')

function addGalleryImage() {
  form.value.gallery.push({ path: null, altRo: '', altEn: '', aspect: '16/10' })
}

function removeGalleryImage(index: number) {
  form.value.gallery.splice(index, 1)
}
</script>

<template>
  <ProjectsEditorSection title="Imagini">
    <div class="mt-4 flex flex-col gap-6">
      <div>
        <AdminImageUpload
          v-model="form.coverPath"
          :bucket="MEDIA_BUCKET"
          ratio="16/10"
          label="[ copertă card — 1200 × 750 ]"
          :path-prefix="`${pathPrefix}/cover`"
        />
        <div class="mt-3">
          <AdminFieldPair v-model:ro="form.coverAlt.ro" v-model:en="form.coverAlt.en" label="Text alternativ copertă" required />
        </div>
      </div>
      <div>
        <AdminImageUpload
          v-model="form.heroPath"
          :bucket="MEDIA_BUCKET"
          ratio="16/9"
          label="[ captură principală — 1600 × 900 ]"
          :path-prefix="`${pathPrefix}/hero`"
        />
        <div class="mt-3">
          <AdminFieldPair v-model:ro="form.heroAlt.ro" v-model:en="form.heroAlt.en" label="Text alternativ captură principală" required />
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between">
          <div class="eyebrow text-muted">Galerie</div>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 eyebrow text-signal" @click="addGalleryImage">
            + Imagine
          </button>
        </div>
        <div v-if="!form.gallery.length" class="mt-2 rounded border border-dashed border-hairline p-4 text-center text-[13px] text-muted">
          Fără imagini încă — apasă „+ Imagine".
        </div>
        <div v-else class="mt-2 grid grid-cols-2 gap-4">
          <div v-for="(img, i) in form.gallery" :key="i" class="relative">
            <AdminImageUpload
              v-model="img.path"
              :bucket="MEDIA_BUCKET"
              ratio="16/10"
              :label="`[ galerie ${i + 1} ]`"
              :path-prefix="`${pathPrefix}/gallery-${i}`"
            />
            <div class="mt-3 flex items-start gap-3">
              <div class="flex-1">
                <AdminFieldPair v-model:ro="img.altRo" v-model:en="img.altEn" label="Text alternativ" />
              </div>
              <button type="button" class="mt-6 cursor-pointer border-0 bg-transparent p-0 eyebrow-sm text-muted hover:text-signal" @click="removeGalleryImage(i)">
                Șterge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
