<script setup lang="ts">
import { createStorageRepository } from '#layers/core/app/data/storageRepository'
import type { Database } from '#layers/core/shared/types/database.types'
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { imageExtension } from '#layers/core/shared/utils/imageExtension'

const props = defineProps<{
  modelValue: string | null
  ratio: '16/9' | '16/10' | '4/3'
  label: string
  pathPrefix: string
  bucket: string
}>()
// `uploading` lets the parent block its save while a file is in flight.
const emit = defineEmits<{ 'update:modelValue': [string]; uploading: [boolean] }>()

const storage = createStorageRepository(useSupabaseClient<Database>())
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const error = ref('')

function setUploading(value: boolean) {
  uploading.value = value
  emit('uploading', value)
}
// An unmounted instance (a removed gallery slot) must not leave the parent's counter stuck.
onBeforeUnmount(() => {
  if (uploading.value) emit('uploading', false)
})

const MAX_BYTES = 8 * 1024 * 1024

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = ''

  const ext = imageExtension(file.type)
  if (!ext) {
    error.value = 'Format neacceptat. Folosește JPG, PNG, WebP sau AVIF.'
    input.value = ''
    return
  }
  if (file.size > MAX_BYTES) {
    error.value = `Fișier prea mare (${(file.size / 1024 / 1024).toFixed(1)} MB). Maxim ${MAX_BYTES / 1024 / 1024} MB.`
    input.value = ''
    return
  }

  setUploading(true)

  const path = `${props.pathPrefix}/${Date.now()}.${ext}`

  try {
    // Uploading never deletes the file it replaces: the published page keeps
    // serving that file until the project is saved. The project editor removes
    // replaced files after a successful save.
    emit('update:modelValue', await storage.uploadPublic(props.bucket, path, file))
  } catch (caught) {
    error.value = 'Upload eșuat: ' + toAppError(caught).message
    setUploading(false)
    return
  }
  setUploading(false)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="relative">
    <MediaFrame :ratio="ratio" :src="modelValue ?? undefined" :label="label" />
    <button
      type="button"
      class="absolute bottom-3 right-3 cursor-pointer rounded border border-hairline bg-paper px-3 py-1.5 eyebrow text-ink hover:border-ink"
      :disabled="uploading"
      @click="openFilePicker"
    >
      {{ uploading ? 'Se încarcă…' : modelValue ? 'Înlocuiește' : 'Încarcă' }}
    </button>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" >
    <p v-if="error" class="mt-2 font-mono text-xs text-signal-text">{{ error }}</p>
  </div>
</template>
