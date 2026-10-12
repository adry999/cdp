<script setup lang="ts">
// Round "i" button with a hover/focus tooltip. The tooltip describes the button and
// closes with Escape (WCAG 1.4.13); it returns on the next hover or focus.
withDefaults(
  defineProps<{
    label: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

const id = useId()
const open = ref(false)
const dismissed = ref(false)

function show() {
  open.value = true
  dismissed.value = false
}

function hide() {
  open.value = false
  dismissed.value = false
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) dismissed.value = true
}

onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <span
    class="group/tooltip relative inline-flex items-center"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <button
      type="button"
      :aria-label="label"
      :aria-describedby="id"
      class="relative inline-flex items-center justify-center rounded-full border border-rule/70 font-mono font-medium text-muted transition-colors before:absolute before:content-[''] hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
      :class="size === 'sm' ? 'h-4 w-4 cursor-pointer text-[10px] before:-inset-3.5' : 'h-5 w-5 cursor-default text-[11px] before:-inset-3'"
    >
      i
    </button>
    <span
      :id="id"
      role="tooltip"
      class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(300px,85vw)] -translate-x-1/2 rounded border border-hairline bg-inverse p-3 font-normal leading-relaxed tracking-normal text-on-inverse opacity-0 shadow-lg transition-opacity duration-150 group-focus-within/tooltip:pointer-events-auto group-focus-within/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto group-hover/tooltip:opacity-100"
      :class="[size === 'sm' ? 'text-xs' : 'text-[13px]', dismissed && 'pointer-events-none! opacity-0!']"
    >
      <slot />
      <span class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-inverse" aria-hidden="true" />
    </span>
  </span>
</template>
