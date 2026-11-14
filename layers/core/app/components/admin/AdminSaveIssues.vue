<script setup lang="ts">
// Why the last save failed, under an editor's topbar: every validation issue, or the error
// itself when the server refused. The page calls `reveal()` after a failed save, so the reason
// is in view and focused even when the save was started from the bottom of a long form.
defineProps<{ issues: readonly string[]; message?: string | null }>()

const el = ref<HTMLElement | null>(null)

function reveal() {
  el.value?.scrollIntoView({ block: 'start' })
  el.value?.focus({ preventScroll: true })
}

defineExpose({ reveal })
</script>

<template>
  <div
    v-if="issues.length || message"
    ref="el"
    role="alert"
    tabindex="-1"
    class="scroll-mt-24 rounded border border-signal-text px-4 py-3 text-[14px] outline-none"
  >
    <div class="eyebrow text-signal-text">Nu s-a salvat</div>
    <ul v-if="issues.length" class="mt-2 list-disc pl-5">
      <li v-for="(issue, i) in issues" :key="i">{{ issue }}</li>
    </ul>
    <p v-else class="m-0 mt-2">{{ message }}</p>
  </div>
</template>
