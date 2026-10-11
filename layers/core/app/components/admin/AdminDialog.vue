<script setup lang="ts">
import { useFocusTrap } from '#layers/core/app/composables/useFocusTrap'

const props = defineProps<{ open: boolean; title: string; busy?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const panel = ref<HTMLElement | null>(null)
const { focusFirst, trapTab } = useFocusTrap(panel)
let previouslyFocused: HTMLElement | null = null

// An in-flight action must finish before the dialog can be dismissed.
function requestClose() {
  if (!props.busy) emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
    return
  }
  trapTab(event)
}

watch(
  () => props.open,
  (open) => {
    if (!import.meta.client) return
    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
      nextTick(focusFirst)
    } else {
      restoreFocus()
    }
  },
  { immediate: true },
)

function restoreFocus() {
  // The trigger can be gone by now (e.g. a deleted row); fall back to the page's main region.
  const target = previouslyFocused?.isConnected ? previouslyFocused : document.querySelector<HTMLElement>('main')
  target?.focus()
  previouslyFocused = null
}

// Parents mount the dialog with v-if, so unmounting is the usual way it closes.
onBeforeUnmount(restoreFocus)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      @click.self="requestClose"
      @keydown="onKeydown"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="max-h-full w-full max-w-[520px] overflow-y-auto rounded border border-hairline bg-paper p-6"
      >
        <h2 :id="titleId" class="m-0 mb-4 text-lg font-medium tracking-[-0.02em]">{{ title }}</h2>
        <slot />
        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
