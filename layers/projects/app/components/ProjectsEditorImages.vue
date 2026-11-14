<script setup lang="ts">
import { moveItem } from '#layers/core/shared/utils/moveItem'
import type { ProjectForm } from '#layers/projects/domain/projectForm'
import { slugify, type ProjectImageInput } from '#layers/projects/domain/projectPayload'
import { createProjectsMediaRepository } from '#layers/projects/data/projectsMediaRepository'

const form = defineModel<ProjectForm>({ required: true })
// True while any of the cover, hero or gallery uploads is in flight.
const uploading = defineModel<boolean>('uploading', { default: false })
/** Fields the last failed save rejected, by `ValidationIssue.field`. */
defineProps<{ invalidFields: ReadonlySet<string> }>()

const media = createProjectsMediaRepository()
// The server only accepts safe key segments, so a slug still being typed ("Proiect Nou") must not reach it raw.
const pathPrefix = computed(() => slugify(form.value.slugRo) || 'proiect-nou')

// Stable keys: keyed by index, removing or moving a slot would hand an in-flight upload to another image.
const slotKeys = new WeakMap<ProjectImageInput, number>()
let nextKey = 0
function keyOf(img: ProjectImageInput) {
  let key = slotKeys.get(img)
  if (key === undefined) slotKeys.set(img, (key = nextKey++))
  return key
}

let activeUploads = 0
function onUploading(active: boolean) {
  activeUploads = Math.max(0, activeUploads + (active ? 1 : -1))
  uploading.value = activeUploads > 0
}

function addGalleryImage() {
  form.value.gallery.push({ path: null, altRo: '', altEn: '', aspect: '16/9' })
}

function removeGalleryImage(index: number) {
  form.value.gallery.splice(index, 1)
}

function moveGalleryImage(index: number, to: number) {
  form.value.gallery = moveItem(form.value.gallery, index, to)
}
</script>

<template>
  <ProjectsEditorSection title="Imagini">
    <div class="mt-4 flex flex-col gap-6">
      <div>
        <AdminImageUpload
          v-model="form.coverPath"
          :upload="media.upload"
          ratio="16/9"
          label="[ copertă card — 1600 × 900 ]"
          :path-prefix="`${pathPrefix}/cover`"
          removable
          @uploading="onUploading"
        />
        <div class="mt-3">
          <AdminFieldPair v-model:ro="form.coverAlt.ro" v-model:en="form.coverAlt.en" label="Text alternativ copertă" required :invalid="invalidFields.has('coverAlt')" />
        </div>
      </div>
      <div>
        <AdminImageUpload
          v-model="form.heroPath"
          :upload="media.upload"
          ratio="16/9"
          label="[ captură principală — 1600 × 900 ]"
          :path-prefix="`${pathPrefix}/hero`"
          removable
          @uploading="onUploading"
        />
        <div class="mt-3">
          <AdminFieldPair v-model:ro="form.heroAlt.ro" v-model:en="form.heroAlt.en" label="Text alternativ captură principală" required :invalid="invalidFields.has('heroAlt')" />
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between">
          <div class="eyebrow text-muted">Galerie</div>
          <button type="button" class="tap-text eyebrow text-signal-text" @click="addGalleryImage">
            + Imagine
          </button>
        </div>
        <p class="mt-1 text-[13px] text-muted">
          Textul alternativ apare și ca descriere sub imagine pe site („Titlu: text”).
        </p>
        <div v-if="!form.gallery.length" class="mt-2 rounded border border-dashed border-hairline p-4 text-center text-[13px] text-muted">
          Fără imagini încă — apasă „+ Imagine”.
        </div>
        <div v-else class="mt-2 grid grid-cols-2 gap-4">
          <div v-for="(img, i) in form.gallery" :key="keyOf(img)" class="relative">
            <AdminImageUpload
              v-model="img.path"
              :upload="media.upload"
              ratio="16/9"
              :label="`[ galerie ${i + 1} — 1600 × 900 ]`"
              :path-prefix="`${pathPrefix}/gallery`"
              @uploading="onUploading"
            />
            <div class="mt-3 flex items-start gap-3">
              <div class="flex-1">
                <AdminFieldPair
                  v-model:ro="img.altRo"
                  v-model:en="img.altEn"
                  label="Text alternativ"
                  required
                  :invalid="invalidFields.has(`gallery.${i}`)"
                />
              </div>
              <div class="mt-6 flex flex-col items-end gap-2">
                <div class="flex gap-1">
                  <AdminArrowButton
                    direction="left"
                    :disabled="i === 0"
                    :aria-label="`Mută imaginea ${i + 1} mai devreme`"
                    @click="moveGalleryImage(i, i - 1)"
                  />
                  <AdminArrowButton
                    direction="right"
                    :disabled="i === form.gallery.length - 1"
                    :aria-label="`Mută imaginea ${i + 1} mai târziu`"
                    @click="moveGalleryImage(i, i + 1)"
                  />
                </div>
                <button
                  type="button"
                  class="tap-text eyebrow-sm text-muted hover:text-signal-text"
                  :aria-label="`Șterge imaginea ${i + 1}`"
                  @click="removeGalleryImage(i)"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ProjectsEditorSection>
</template>
