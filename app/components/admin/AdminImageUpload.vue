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

function pick() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  error.value = ''
  uploading.value = true

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
