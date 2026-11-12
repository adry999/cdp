<script setup lang="ts">
import { toAppError } from '#layers/core/shared/utils/toAppError'
import { imageExtension } from '#layers/core/shared/utils/imageExtension'

const props = defineProps<{
  modelValue: string | null
  ratio: '16/9' | '16/10' | '4/3'
  label: string
  pathPrefix: string
  // Owned by the module that stores the image (core cannot import it): stores the file below
  // `pathPrefix` under a fresh key and resolves to its public URL.
  upload: (pathPrefix: string, file: File) => Promise<string>
  // Shows a button that clears the image (sets the model to null).
  removable?: boolean
}>()
// `uploading` lets the parent block its save while a file is in flight.
const emit = defineEmits<{ 'update:modelValue': [string | null]; uploading: [boolean] }>()

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
  // Cleared up front so picking the same file again (e.g. after a failed upload) fires `change`.
  input.value = ''
  if (!file) return

  error.value = ''

  if (!imageExtension(file.type)) {
    error.value = 'Format neacceptat. Folosește JPG, PNG, WebP sau AVIF.'
    return
  }
  if (file.size > MAX_BYTES) {
    error.value = `Fișier prea mare (${(file.size / 1024 / 1024).toFixed(1)} MB). Maxim ${MAX_BYTES / 1024 / 1024} MB.`
    return
  }

  setUploading(true)
  try {
    // Uploading never deletes the file it replaces: the published page keeps
    // serving that file until the project is saved. The project editor removes
    // replaced files after a successful save.
    emit('update:modelValue', await props.upload(props.pathPrefix, file))
  } catch (caught) {
    error.value = 'Upload eșuat: ' + toAppError(caught).message
  } finally {
    setUploading(false)
  }
}
</script>

<template>
  <div class="relative">
    <MediaFrame :ratio="ratio" :src="modelValue ?? undefined" :label="label" />
    <div class="absolute bottom-3 right-3 flex gap-2">
      <button
        v-if="removable && modelValue"
        type="button"
        class="cursor-pointer rounded border border-hairline bg-paper px-3 py-1.5 eyebrow text-muted hover:border-ink hover:text-ink"
        :disabled="uploading"
        :aria-label="`Elimină ${label}`"
        @click="emit('update:modelValue', null)"
      >
        Elimină
      </button>
      <button
        type="button"
        class="cursor-pointer rounded border border-hairline bg-paper px-3 py-1.5 eyebrow text-ink hover:border-ink"
        :disabled="uploading"
        :aria-label="`${modelValue ? 'Înlocuiește' : 'Încarcă'} ${label}`"
        @click="openFilePicker"
      >
        {{ uploading ? 'Se încarcă…' : modelValue ? 'Înlocuiește' : 'Încarcă' }}
      </button>
    </div>
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden" @change="onFileChange" >
    <p v-if="error" role="alert" class="mt-2 font-mono text-xs text-signal-text">{{ error }}</p>
  </div>
</template>
