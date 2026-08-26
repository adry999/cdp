<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
  ratio: '16/9' | '16/10' | '4/3'
  label: string
  pathPrefix: string
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const supabase = useSupabaseClient()
const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const error = ref('')

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function pick() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  error.value = ''

  if (!ACCEPTED_TYPES.includes(file.type)) {
    error.value = 'Format neacceptat. Folosește JPG, PNG, WebP sau AVIF.'
    input.value = ''
    return
  }
  if (file.size > MAX_BYTES) {
    error.value = `Fișier prea mare (${(file.size / 1024 / 1024).toFixed(1)} MB). Maxim ${MAX_BYTES / 1024 / 1024} MB.`
    input.value = ''
    return
  }

  uploading.value = true

  const previousPath = storageKeyFromPublicUrl(props.modelValue, 'project-media')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${props.pathPrefix}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('project-media')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    error.value = 'Upload eșuat: ' + uploadError.message
    uploading.value = false
    return
  }

  // Best-effort: the new image is already live, so a failure here just
  // leaves one orphaned file rather than blocking the save.
  if (previousPath && previousPath !== path) {
    await supabase.storage.from('project-media').remove([previousPath]).catch(() => {})
  }

  const { data } = supabase.storage.from('project-media').getPublicUrl(path)
  emit('update:modelValue', data.publicUrl)
  uploading.value = false
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="relative">
    <MediaFrame :ratio="ratio" :src="modelValue ?? undefined" :label="label" />
    <button
      type="button"
      class="absolute bottom-3 right-3 cursor-pointer rounded border border-hairline bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink hover:border-ink"
      :disabled="uploading"
      @click="pick"
    >
      {{ uploading ? 'Se încarcă…' : modelValue ? 'Înlocuiește' : 'Încarcă' }}
    </button>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
    <p v-if="error" class="mt-2 font-mono text-xs text-signal">{{ error }}</p>
  </div>
</template>
